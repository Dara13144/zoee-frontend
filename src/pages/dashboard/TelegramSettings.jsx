import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Send, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, MessageSquare } from 'lucide-react';

export default function TelegramSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/telegram/status');
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/telegram/generate-code');
      if (res.success) {
        setData(prev => ({ ...prev, pairingCode: res.data.pairingCode }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading Telegram settings...</div>;
  }

  const { connected, chatId, pairingCode, botUsername, botLink } = data || {};

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Telegram Instant Notifications</h2>
            <p className="text-xs text-slate-400">Get notified instantly in your private Telegram chat whenever a donation is paid</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          connected ? 'bg-accent-emerald/20 text-accent-emerald border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }`}>
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>

      {connected ? (
        <div className="p-6 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 space-y-3">
          <div className="flex items-center gap-2 text-accent-emerald font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Telegram Bot Connected to Chat ID: {chatId}</span>
          </div>
          <p className="text-xs text-slate-300">
            You will receive instant push notifications with the donor's name, amount, message, and transaction reference.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl bg-dark-surface border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">How to Connect</h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
            <li>
              Open Telegram and search for bot{' '}
              <a
                href={botLink || 'https://t.me/DaraDonationBot'}
                target="_blank"
                rel="noreferrer"
                className="text-accent-cyan font-bold underline inline-flex items-center gap-1"
              >
                @{botUsername || 'DaraDonationBot'} <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Press <strong>/start</strong> in the Telegram chat</li>
            <li>Send your secret pairing code to the bot:</li>
          </ol>

          {pairingCode ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-card border border-brand-500/30 max-w-sm">
              <span className="text-base font-mono font-black text-brand-300 tracking-wider flex-1 text-center">
                {pairingCode}
              </span>
              <button
                onClick={() => copyCode(pairingCode)}
                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              disabled={generating}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white"
            >
              Generate Pairing Code
            </button>
          )}

          <div className="pt-2">
            <button
              onClick={fetchStatus}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Check Connection Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
