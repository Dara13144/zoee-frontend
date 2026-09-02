import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { renderSVG } from 'uqr';
import confetti from 'canvas-confetti';
import soundService from '../services/soundService';
import ttsService from '../services/ttsService';
import api from '../services/api';
import {
  CheckCircle2,
  Clock,
  X,
  Zap
} from 'lucide-react';

// Official Bakong/KHQR Wordmark
function BakongWordmark() {
  return (
    <div className="flex items-center gap-2.5 text-white select-none">
      <div className="flex items-center gap-1">
        <span className="text-base font-black tracking-widest uppercase text-white">KHQR</span>
        <span className="text-white/50 mx-1">|</span>
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">BAKONG</span>
      </div>
    </div>
  );
}

// Riel Medallion (centered on QR code, covers center so only ECC-H can survive)
function RielMedallion({ className = '' }) {
  return (
    <div className={`w-12 h-12 rounded-full bg-white shadow-2xl border-[3px] border-[#E1251B] flex items-center justify-center pointer-events-none select-none z-10 ${className}`}>
      <div className="w-9 h-9 rounded-full bg-[#E1251B] text-white font-black text-base flex items-center justify-center">
        ៛
      </div>
    </div>
  );
}

// Status Panel (shown after terminal state)
function StatusPanel({ icon, title, subtitle, color = 'green' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3 animate-in zoom-in-95 duration-300">
      {icon}
      <h4 className="text-lg font-black text-slate-900">{title}</h4>
      {subtitle && <p className="text-xs text-slate-500 text-center max-w-[200px]">{subtitle}</p>}
    </div>
  );
}

// Auto-payment status badge
function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Waiting for payment…', color: 'text-amber-500', dot: 'bg-amber-400 animate-pulse' },
    scanned: { label: 'QR Scanned! Confirm in app', color: 'text-blue-500', dot: 'bg-blue-400 animate-pulse' },
    paid: { label: 'Payment confirmed! ✅', color: 'text-emerald-500', dot: 'bg-emerald-400' },
    expired: { label: 'QR expired', color: 'text-orange-500', dot: 'bg-orange-400' },
    failed: { label: 'Payment failed', color: 'text-red-500', dot: 'bg-red-400' },
  };
  const s = map[status] || map.pending;
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </div>
  );
}

const TERMINAL = new Set(['paid', 'expired', 'failed', 'cancelled']);

export default function PaymentModal({ paymentData, onClose, onPaymentSuccess }) {
  const [status, setStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const successFiredRef = useRef(false);

  const {
    transactionId,
    amount,
    currency = 'USD',
    paymentMethod = 'CUTLUY',
    qrData,
    paymentUrl,
    checkoutUrl,
    donorName = 'Supporter',
    message,
    providerPayload
  } = paymentData || {};

  // Best-effort QR string (from CutLuy response)
  const effectiveQrString = useMemo(() => {
    return (
      providerPayload?.qrString ||
      providerPayload?.qrData ||
      providerPayload?.rawResponse?.qr_string ||
      qrData ||
      `00020101021229330016cutluy_demo@bkrt0109000000000520459995303840540${Number(amount || 1).toFixed(2)}5802KH5913Zoee Donation6010Phnom Penh621401${transactionId?.slice(-12) || 'ZOEEDONATION'}63045F4B`
    );
  }, [qrData, providerPayload, amount, transactionId]);

  const effectiveCheckoutUrl = useMemo(() => (
    providerPayload?.checkoutUrl ||
    providerPayload?.paymentUrl ||
    providerPayload?.rawResponse?.checkout_url ||
    checkoutUrl ||
    paymentUrl
  ), [checkoutUrl, paymentUrl, providerPayload]);

  // Render QR at ECC=H so Riel Medallion doesn't break scanning
  const qrSvg = useMemo(() => {
    try {
      return effectiveQrString ? renderSVG(effectiveQrString, { ecc: 'H' }) : null;
    } catch { return null; }
  }, [effectiveQrString]);

  // ── Countdown timer ──────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (status === 'pending' || status === 'scanned') setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-payment live polling (calls /api/payments/poll/:txnId) ──
  useEffect(() => {
    if (!transactionId || TERMINAL.has(status)) return;

    pollRef.current = setInterval(async () => {
      try {
        // /poll actively queries CutLuy API and auto-confirms PAID server-side
        const res = await api.get(`/payments/poll/${transactionId}`);
        if (res?.success && res?.data) {
          const nextStatus = (res.data.status || '').toLowerCase();
          if (nextStatus !== status) {
            setStatus(nextStatus);
          }
          if (nextStatus === 'paid' && !successFiredRef.current) {
            successFiredRef.current = true;
            clearInterval(pollRef.current);
            fireSuccess();
          } else if (TERMINAL.has(nextStatus)) {
            clearInterval(pollRef.current);
          }
        }
      } catch (err) {
        console.warn('Payment poll error:', err.message);
      }
    }, 2500);

    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, status]);

  const fireSuccess = () => {
    setStatus('paid');
    soundService.playSound?.('cash', 0.9);
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      ttsService.speak?.({
        text: message || (currency === 'KHR' ? 'អរគុណសម្រាប់ការគាំទ្រ!' : 'Thank you for your support!'),
        donorName: donorName || 'Anonymous',
        amount,
        currency,
        voice: 'khmer_natural',
        minAmount: 0
      });
    }, 500);
    if (onPaymentSuccess) setTimeout(() => onPaymentSuccess(), 5000);
  };

  // ── Sandbox simulate ─────────────────────────────────────────────
  const handleSimulatePayment = async () => {
    setVerifying(true);
    setErrorMsg('');
    try {
      const res = await api.post('/payments/sandbox-verify', { transactionId, status: 'SUCCESS' });
      if (res.success) {
        if (!successFiredRef.current) {
          successFiredRef.current = true;
          clearInterval(pollRef.current);
          fireSuccess();
        }
      } else {
        setErrorMsg(res.message || 'Simulation failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification error.');
    } finally {
      setVerifying(false);
    }
  };

  const copyQrString = () => {
    navigator.clipboard.writeText(effectiveQrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isDone = status === 'paid';
  const isScanned = status === 'scanned';
  const isExpired = status === 'expired' || status === 'failed';
  const showQr = !isDone && !isScanned && !isExpired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#181A24', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="p-5 space-y-4">
          {/* ── Official BakongCard ──────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl shadow-2xl bg-white">
            {/* Red KHQR Header */}
            <div className="flex items-center justify-between bg-[#E1251B] px-4 py-3">
              <BakongWordmark />
              {/* Auto-payment badge */}
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <Zap className="w-2.5 h-2.5 text-white" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wide">Auto Pay</span>
              </div>
            </div>

            {/* Merchant Info + Amount (tear line) */}
            <div className="relative border-b border-dashed border-gray-200 px-5 py-3">
              {/* CSS folded corner triangle */}
              <div className="absolute -top-px right-0 h-0 w-0 border-t-[22px] border-l-[22px] border-t-[#E1251B] border-l-transparent" />
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-4 h-4 rounded-full bg-[#E1251B] text-white text-[9px] font-black flex items-center justify-center">Z</div>
                <span className="text-[11px] font-semibold text-slate-600">Zoee Donation · {donorName}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {currency === 'KHR' ? Number(amount).toLocaleString() : Number(amount).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">{currency}</span>
              </div>
            </div>

            {/* QR Area — swapped for state panel once terminal */}
            <div className="relative flex items-center justify-center min-h-[220px] bg-white p-4">
              {isDone ? (
                <StatusPanel
                  icon={<CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />}
                  title="Payment Received! 🎉"
                  subtitle="Your donation alert is now playing live on stream."
                />
              ) : isScanned ? (
                <StatusPanel
                  icon={<CheckCircle2 className="w-14 h-14 text-blue-500 animate-pulse" />}
                  title="QR Scanned"
                  subtitle="Please confirm the payment in your banking app."
                />
              ) : isExpired ? (
                <StatusPanel
                  icon={<Clock className="w-14 h-14 text-orange-400" />}
                  title="Payment Expired"
                  subtitle="This QR code is no longer valid. Please try again."
                />
              ) : (
                /* Live QR + Riel Medallion */
                <div className="relative flex items-center justify-center">
                  <div className="bg-white rounded-xl p-1.5">
                    {qrSvg ? (
                      <div
                        className="w-[190px] h-[190px] [&_svg]:w-full [&_svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                      />
                    ) : (
                      <QRCodeSVG value={effectiveQrString} size={190} level="H" includeMargin={false} />
                    )}
                  </div>
                  {/* Riel Medallion centered */}
                  <RielMedallion className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              )}
            </div>
          </div>

          {/* Auto-pay status line */}
          <div className="flex items-center justify-between px-1">
            <StatusBadge status={status} />
            {!isDone && !isExpired && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className="font-mono text-amber-300 font-bold">{fmt(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Scan instruction */}
          {showQr && (
            <p className="text-center text-[11px] text-slate-400">
              Scan with <strong className="text-white">ABA Mobile</strong>, <strong className="text-white">Bakong</strong>, or any KHQR banking app
            </p>
          )}







          {errorMsg && (
            <p className="text-[11px] text-red-400 text-center">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
