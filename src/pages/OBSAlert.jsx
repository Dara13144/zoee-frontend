import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Sparkles, Zap, Star, Music } from 'lucide-react';
import soundService from '../services/soundService';
import ttsService from '../services/ttsService';
import api, { getApiUrl } from '../services/api';


// ─── Animation Variants ──────────────────────────────────────────────────────
const ANIMATION_VARIANTS = {
  neon: {
    initial: { opacity: 0, scale: 0.7, y: 60, filter: 'blur(12px)' },
    animate: {
      opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 280, damping: 22, duration: 0.55 }
    },
    exit: {
      opacity: 0, scale: 0.8, y: -50, filter: 'blur(8px)',
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  },
  bounce: {
    initial: { opacity: 0, scale: 0.4, y: -120 },
    animate: {
      opacity: 1, scale: 1, y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 18, duration: 0.6 }
    },
    exit: {
      opacity: 0, scale: 0.85, y: 80,
      transition: { duration: 0.35, ease: 'easeIn' }
    }
  },
  slide: {
    initial: { opacity: 0, x: -500, skewX: -12 },
    animate: {
      opacity: 1, x: 0, skewX: 0,
      transition: { type: 'spring', stiffness: 200, damping: 24, duration: 0.6 }
    },
    exit: {
      opacity: 0, x: 500,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  },
  fade: {
    initial: { opacity: 0, scale: 0.92, filter: 'blur(4px)' },
    animate: {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: {
      opacity: 0, scale: 0.95,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  },
  zoom: {
    initial: { opacity: 0, scale: 2.5, rotate: -5 },
    animate: {
      opacity: 1, scale: 1, rotate: 0,
      transition: { type: 'spring', stiffness: 320, damping: 25, duration: 0.55 }
    },
    exit: {
      opacity: 0, scale: 0.4, rotate: 8,
      transition: { duration: 0.35, ease: 'easeIn' }
    }
  }
};

// ─── Glowing Particle Burst (decorative sparkles) ────────────────────────────
function ParticleBurst({ active }) {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(i => {
        const angle = (i / 12) * 360;
        const dist = 60 + Math.random() * 80;
        const size = 4 + Math.random() * 6;
        const colors = ['#a78bfa', '#f472b6', '#22d3ee', '#fbbf24', '#34d399'];
        const color = colors[i % colors.length];
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              backgroundColor: color,
              left: '50%', top: '50%',
              boxShadow: `0 0 8px 2px ${color}80`
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              opacity: 0,
              scale: 0.2
            }}
            transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

// ─── Progress / Countdown Bar ────────────────────────────────────────────────
function CountdownBar({ durationSec, playing }) {
  const [progress, setProgress] = useState(100);
  useEffect(() => {
    if (!playing) { setProgress(100); return; }
    setProgress(100);
    const step = 100 / (durationSec * 20); // update 20x/sec
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev - step;
        if (next <= 0) { clearInterval(timer); return 0; }
        return next;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [playing, durationSec]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl overflow-hidden bg-white/10">
      <motion.div
        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400"
        style={{ width: `${progress}%` }}
        transition={{ ease: 'linear' }}
      />
    </div>
  );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({ alertData, alertSettings, streamer, animation = 'neon', onDone }) {
  const [burst, setBurst] = useState(true);
  const durationSec = alertSettings?.duration || 8;
  const formattedAmount = alertData.currency === 'KHR'
    ? `${Number(alertData.amount).toLocaleString()} ៛`
    : `$${Number(alertData.amount).toFixed(2)}`;

  const variants = ANIMATION_VARIANTS[animation] || ANIMATION_VARIANTS.neon;

  useEffect(() => {
    const t = setTimeout(() => setBurst(false), 900);
    return () => clearTimeout(t);
  }, []);

  const isTest = alertData.isTest;

  return (
    <motion.div
      key={alertData.id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative"
    >
      <ParticleBurst active={burst} />

      {/* Main Alert Card */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15,12,30,0.97) 0%, rgba(30,20,60,0.97) 50%, rgba(15,12,30,0.97) 100%)',
          border: '2px solid rgba(167,139,250,0.6)',
          boxShadow: '0 0 60px rgba(139,92,246,0.5), 0 0 120px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.07)',
          minWidth: 340,
          maxWidth: 520
        }}
      >
        {/* Animated shimmer top line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: 'linear-gradient(90deg, transparent, #a78bfa, #22d3ee, #f472b6, transparent)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Test badge */}
        {isTest && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold uppercase tracking-widest">
            TEST
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Header Row: icon + badge */}
          <div className="flex items-center gap-3">
            {/* Pulsing Icon */}
            <motion.div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                boxShadow: '0 0 20px rgba(139,92,246,0.6)'
              }}
              animate={{ scale: [1, 1.12, 1], boxShadow: ['0 0 20px rgba(139,92,246,0.6)', '0 0 35px rgba(139,92,246,0.9)', '0 0 20px rgba(139,92,246,0.6)'] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-300">
                  {isTest ? '🎭 Test Alert' : '🔴 New Donation'}
                </span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-rose-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </div>
              {streamer && (
                <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">
                  @{streamer.slug} · Zoee Donation Live
                </p>
              )}
            </div>

            {/* Amount Badge */}
            <motion.div
              className="shrink-0 px-3 py-1.5 rounded-xl font-black text-base font-mono text-white"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
                boxShadow: '0 0 16px rgba(139,92,246,0.5)'
              }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
            >
              {formattedAmount}
            </motion.div>
          </div>

          {/* Donor Name */}
          <div className="space-y-1">
            <motion.h2
              className="text-2xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #fff 0%, #c4b5fd 50%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                lineHeight: 1.1
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {alertData.donor_name || 'Anonymous'}
            </motion.h2>
            <motion.p
              className="text-xs text-slate-400 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              donated {formattedAmount} · {alertData.payment_method || 'KHQR'}
            </motion.p>
          </div>

          {/* Message */}
          {alertData.message && (
            <motion.div
              className="px-4 py-3 rounded-2xl text-sm font-medium text-slate-100 leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <span className="text-violet-400 font-black mr-1">"</span>
              {alertData.message}
              <span className="text-violet-400 font-black ml-1">"</span>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            className="flex items-center justify-between pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              Zoee Donation · Live Stream Support
            </div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                >
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Countdown progress bar */}
        <CountdownBar durationSec={durationSec} playing={true} />
      </div>
    </motion.div>
  );
}

// ─── Main OBSAlert Component ──────────────────────────────────────────────────
export default function OBSAlert() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || username;

  const [alertSettings, setAlertSettings] = useState(null);
  const [streamer, setStreamer] = useState(null);
  const [currentAlert, setCurrentAlert] = useState(null);

  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const sseRef = useRef(null);

  // ── 1. Set transparent background for OBS Browser Source ──────────────────
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  // ── 2. Load alert settings ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    api.get(`/alerts/config/${token}`)
      .then(res => {
        if (res.success && res.data) {
          setAlertSettings(res.data.alertSettings);
          setStreamer(res.data.streamer);
        }
      })
      .catch(err => console.warn('[OBSAlert] Failed to load config:', err.message));
  }, [token]);

  // ── 3. Process alert queue (sequential, waits for current alert to finish) ─
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    const nextAlert = queueRef.current.shift();
    setCurrentAlert(nextAlert);

    const settings = nextAlert._settings;
    const soundPreset = settings?.sound_url || 'chime';
    const volume = settings?.sound_volume ?? 0.85;
    const durationSec = settings?.duration || 8;

    // Play sound
    soundService.playSound(soundPreset, volume);

    // Read TTS
    if (settings?.tts_enabled !== false && nextAlert.tts_enabled !== false) {
      const minTTS = settings?.minimum_tts_amount || 1.0;
      ttsService.speak({
        text: nextAlert.message,
        donorName: nextAlert.donor_name || 'Anonymous',
        amount: nextAlert.amount,
        currency: nextAlert.currency || 'USD',
        minAmount: minTTS,
        voice: settings?.tts_voice || 'khmer_natural',
        rate: settings?.tts_speed || 1.0,
        template: settings?.tts_template || '',
        streamerName: nextAlert._streamerSlug || ''
      });
    }

    // Clear after duration
    setTimeout(() => {
      setCurrentAlert(null);
      setTimeout(() => {
        isProcessingRef.current = false;
        processQueue(); // process next in queue
      }, 600); // 600ms gap between alerts
    }, durationSec * 1000);
  }, []);

  // ── 4. SSE Connection with auto-reconnect ──────────────────────────────────
  useEffect(() => {
    if (!token) return;

    let reconnectTimer = null;
    let retryDelay = 3000;

    const connect = () => {
      if (sseRef.current) {
        sseRef.current.close();
      }

      const es = new EventSource(getApiUrl(`/alerts/stream/${token}`));

      sseRef.current = es;

      es.onopen = () => {
        console.log('[OBSAlert] SSE connected ✅');
        retryDelay = 3000; // reset on success
      };

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_DONATION' || payload.type === 'TEST_ALERT') {
            const alertData = {
              ...payload.data,
              id: payload.data.id || `alert-${Date.now()}`,
              _settings: alertSettings,
              _streamerSlug: streamer?.slug || token
            };
            queueRef.current.push(alertData);
            processQueue();
          }
        } catch (err) {
          console.warn('[OBSAlert] SSE parse error:', err);
        }
      };

      es.onerror = () => {
        console.warn(`[OBSAlert] SSE error. Reconnecting in ${retryDelay}ms...`);
        es.close();
        retryDelay = Math.min(retryDelay * 1.5, 30000); // exponential backoff
        reconnectTimer = setTimeout(connect, retryDelay);
      };
    };

    connect();

    return () => {
      if (sseRef.current) sseRef.current.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [token, alertSettings, streamer, processQueue]);

  // ── Manual test trigger from overlay UI ──────────────────────────────────────
  const [triggeringTest, setTriggeringTest] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);

  const handleManualTestAlert = async () => {
    setTriggeringTest(true);
    // Unlock Web Audio & SpeechSynthesis
    soundService.playSound('chime', 0.1);
    setAudioUnlocked(true);

    try {
      const testData = {
        id: `test-alert-${Date.now()}`,
        donor_name: 'Zoee Stream Champion',
        amount: 15.00,
        currency: 'USD',
        message: 'This is a live test donation alert on OBS Studio! 🚀❤️',
        payment_method: 'KHQR',
        isTest: true,
        tts_enabled: true,
        _settings: alertSettings,
        _streamerSlug: streamer?.slug || token
      };

      // Broadcast via API to sync across all overlays and local queue
      await api.post(`/alerts/test/${token}`, {
        streamerSlug: streamer?.slug || token,
        donorName: testData.donor_name,
        amount: testData.amount,
        currency: testData.currency,
        message: testData.message
      }).catch(() => null);

      // Also ensure local queue receives it instantly
      queueRef.current.push(testData);
      processQueue();
    } catch (err) {
      console.error('Manual test alert error:', err);
    } finally {
      setTimeout(() => setTriggeringTest(false), 1000);
    }
  };

  const animStyle = alertSettings?.animation || 'neon';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 select-none overflow-hidden"
      style={{ background: 'transparent' }}
      onClick={() => {
        if (!audioUnlocked) {
          soundService.playSound('chime', 0.05);
          setAudioUnlocked(true);
        }
      }}
    >
      {/* Subtle Studio Overlay Test Controls (Visible on hover in browser/OBS preview) */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-2xl">
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          OBS Live
        </span>
        <button
          type="button"
          onClick={handleManualTestAlert}
          disabled={triggeringTest}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-fuchsia text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {triggeringTest ? 'Triggering...' : 'Trigger Test Alert'}
        </button>
      </div>

      {/* Main Alert Popup Area */}
      <div className="absolute inset-0 flex items-end justify-start p-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {currentAlert && (
            <AlertCard
              key={currentAlert.id}
              alertData={currentAlert}
              alertSettings={alertSettings}
              streamer={streamer}
              animation={animStyle}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

