import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ttsService from '../services/ttsService';
import PaymentModal from '../components/PaymentModal';
import {
  Heart,
  Share2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Volume2,
  User,
  MessageSquare,
  AlertCircle,
  Clock,
  Send,
  ExternalLink,
  Flame,
  Trophy,
  CheckCircle2
} from 'lucide-react';

const PRESET_AMOUNTS_USD = [1, 5, 10, 20, 50, 100];
const PRESET_AMOUNTS_KHR = [4000, 20000, 40000, 80000, 200000, 400000];

export default function PublicDonationPage() {
  const { username: rawUsername } = useParams();
  // Strip optional leading '@' if present in route param (e.g. /@dara -> dara)
  const username = (rawUsername || 'dara_gaming').replace(/^@/, '');
  const navigate = useNavigate();

  const [streamer, setStreamer] = useState(null);
  const [donationPageSettings, setDonationPageSettings] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [topSupporters, setTopSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [donorName, setDonorName] = useState('');

  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CUTLUY');
  const [selectedVoice, setSelectedVoice] = useState('khmer_natural');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  // Modal states
  const [submitting, setSubmitting] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic share URL
  const publicShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/@${username}`
    : `https://zoeedonate.com/@${username}`;

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      api.get(`/streamers/${username}`).catch(() => null),
      api.get(`/donations/recent/${username}?limit=8`).catch(() => null)
    ])
      .then(([streamRes, recentRes]) => {
        if (streamRes?.success && streamRes.data) {
          setStreamer(streamRes.data.streamer);
          setDonationPageSettings(streamRes.data.donationPageSettings || null);
          setTopSupporters(streamRes.data.topSupporters || []);

          if (streamRes.data.streamer?.currency) {
            setCurrency(streamRes.data.streamer.currency);
          }

          // Set SEO metadata dynamically
          const pageTitle = `Donate for ${streamRes.data.streamer?.profile?.display_name || streamRes.data.streamer?.slug} | Zoee Donation`;
          document.title = pageTitle;
        } else {
          setError(`Streamer '@${username}' was not found.`);
        }

        if (recentRes?.success && Array.isArray(recentRes.data)) {
          setRecentDonations(recentRes.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load creator profile.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const handleCurrencyChange = (newCurr) => {
    setCurrency(newCurr);
    if (newCurr === 'KHR' && currency === 'USD') {
      setAmount((parseFloat(amount || 1) * 4100).toString());
    } else if (newCurr === 'USD' && currency === 'KHR') {
      setAmount(Math.max(1, Math.round(parseFloat(amount || 4100) / 4100)).toString());
    }
  };

  const handlePreviewTTS = () => {
    ttsService.stop();
    setIsPlayingTTS(true);
    setTimeout(() => {
      ttsService.speak({
        text: message || (currency === 'KHR' ? 'សួស្តីបង! ជូនពរសំណាងល្អ និងជោគជ័យក្នុងការផ្សាយផ្ទាល់!' : 'Keep up the amazing stream! Great gameplay!'),
        donorName: anonymous ? 'Anonymous' : (donorName || (currency === 'KHR' ? 'អ្នកគាំទ្រ' : 'A fan')),
        amount: amount || (currency === 'KHR' ? '20000' : '5'),
        currency,
        voice: selectedVoice,
        minAmount: 0
      });
      setTimeout(() => setIsPlayingTTS(false), 3800);
    }, 150);
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid donation amount greater than 0.');
      return;
    }

    const minAmount = donationPageSettings?.min_amount || streamer?.min_donation_amount || 1.00;
    if (numAmount < minAmount && currency === 'USD') {
      setError(`Minimum donation amount for this creator is $${minAmount.toFixed(2)} USD.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/donations', {
        streamerSlug: username,
        amount: numAmount,
        currency,
        donorName: anonymous ? 'Anonymous' : (donorName || 'Supporter'),
        anonymous,
        message,
        paymentMethod
      });

      if (res.success && res.data) {
        setActivePayment({
          ...res.data,
          aba_payway_link: streamer.aba_payway_link,
          aba_qr_url: streamer.aba_qr_url
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate donation transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Format relative time helper
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono tracking-wide">Loading Creator Donation Profile...</p>
      </div>
    );
  }

  if (!streamer) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-3xl text-center space-y-4 border border-white/10">
        <h2 className="text-xl font-bold text-white">Creator Not Found</h2>
        <p className="text-xs text-slate-400">{error || `No creator exists with username '@${username}'.`}</p>
        <Link to="/search" className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold">
          Browse All Creators
        </Link>
      </div>
    );
  }

  const presets = currency === 'USD'
    ? (donationPageSettings?.preset_amounts || PRESET_AMOUNTS_USD)
    : PRESET_AMOUNTS_KHR;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 font-sans">
      {/* 1. CREATOR PROFILE HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-brand-500/30 bg-[#161822]/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Glow ambient background aura */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent-cyan/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          {/* Avatar with Animated Ring */}
          <div className="relative shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-brand-500 via-accent-fuchsia to-accent-cyan shadow-[0_0_25px_rgba(139,92,246,0.4)]">
              <img
                src={streamer.profile?.avatar_url || '/zoee-avatar.png'}
                alt={streamer.slug}
                className="w-full h-full rounded-full object-cover border-2 border-dark-card"
                onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
              />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-accent-emerald text-black flex items-center justify-center border-2 border-dark-card shadow-md" title="Verified Streamer">
              <CheckCircle2 className="w-4 h-4 text-black fill-accent-emerald" />
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {streamer.profile?.display_name || streamer.slug}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                @{streamer.slug}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {donationPageSettings?.description || streamer.profile?.bio || 'Full-time streamer and content creator! Support the stream with instant live alerts ❤️'}
            </p>

            {/* Social Links */}
            {streamer.social_links && Object.keys(streamer.social_links).length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {Object.entries(streamer.social_links).map(([platform, url]) => {
                  if (!url) return null;
                  return (
                    <a
                      key={platform}
                      href={url.startsWith('http') ? url : `https://${url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 border border-white/10 hover:border-brand-500/40 transition-all flex items-center gap-1.5"
                    >
                      <span className="capitalize">{platform}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions (Share & Leaderboard) */}
          <div className="flex sm:flex-col items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Share</span>
            </button>
            <Link
              to={`/leaderboard-avatar/${username}`}
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* Stats Pill Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-dark-surface/50 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Received</span>
            <span className="text-sm sm:text-base font-black text-accent-cyan font-mono">${Number(streamer.total_received || 0).toFixed(2)}</span>
          </div>
          <div className="p-2 rounded-xl bg-dark-surface/50 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Supporters</span>
            <span className="text-sm sm:text-base font-black text-white font-mono">{streamer.supporter_count || 0}</span>
          </div>
          <div className="p-2 rounded-xl bg-dark-surface/50 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Live Alerts</span>
            <span className="text-sm sm:text-base font-black text-accent-emerald font-mono flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping"></span> Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN SECTION: Donation Form (Left) & Recent Donations / Top Supporters (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: DONATION FORM (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleCreateDonation} className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/25 bg-[#171923] space-y-7 shadow-2xl">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Step 1: Choose Donation Amount */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  Choose Tip Amount
                </label>
                {/* Currency Switcher */}
                <div className="flex items-center bg-[#1E2128] p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('USD')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('KHR')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currency === 'KHR' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    KHR (៛)
                  </button>
                </div>
              </div>

              {/* Preset Amount Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className={`py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-all ${
                      amount === val.toString()
                        ? 'bg-brand-600/30 border-brand-500 text-white shadow-lg shadow-brand-500/20 scale-105'
                        : 'bg-[#1E2128] border-white/5 text-slate-300 hover:border-brand-500/40'
                    }`}
                  >
                    {currency === 'USD' ? `$${val}` : `${val.toLocaleString()}៛`}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-brand-400 font-mono">
                  {currency === 'USD' ? '$' : '៛'}
                </span>
                <input
                  type="number"
                  min="0.10"
                  step="any"
                  placeholder="Or enter custom amount..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#1E2128] border border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-base font-bold text-white font-mono placeholder-slate-500"
                  required
                />
              </div>

              {/* Spoken AI Audio Pill */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#1E2128]/80 border border-brand-500/20 text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-accent-cyan" />
                  Spoken on stream:
                </span>
                <span className="font-bold text-accent-cyan truncate max-w-[200px]">
                  {currency === 'USD' ? `$${Number(amount || 0).toFixed(2)} USD` : `${Number(amount || 0).toLocaleString()} ៛`}
                </span>
              </div>
            </div>

            {/* Step 2: Donor Info */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  Your Information
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-dark-border bg-dark-surface text-brand-600 focus:ring-brand-500"
                  />
                  <span>Donate Anonymously</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={anonymous ? "Displayed as 'Anonymous'" : "Your Name / Nickname"}
                    disabled={anonymous}
                    value={anonymous ? '' : donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    maxLength={40}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1E2128] border border-white/10 text-xs text-white placeholder-slate-500 transition-all ${
                      anonymous ? 'opacity-50 cursor-not-allowed' : 'focus:border-brand-500'
                    }`}
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>


              </div>
            </div>

            {/* Step 3: Message with Voice AI Readout */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  Message for Streamer (Voice AI Alert)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">{message.length}/255</span>
              </div>

              <textarea
                rows={3}
                placeholder="Cheer on your streamer! (Voice AI will read your message live on stream)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={255}
                className="w-full p-3.5 rounded-2xl bg-[#1E2128] border border-white/10 focus:border-brand-500 text-xs text-white placeholder-slate-500 resize-none shadow-inner"
              />

              {/* Quick Cheer Message Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Quick Cheers:</span>
                {[
                  { label: '🇰🇭 ជូនពរជោគជ័យ!', text: 'សួស្តីបង! ជូនពរសំណាងល្អ និងជោគជ័យក្នុងការផ្សាយផ្ទាល់!' },
                  { label: '🇰🇭 លេងឡូយណាស់!', text: 'លេងឡូយណាស់បង! GG WP!' },
                  { label: '🇰🇭 គាំទ្រជានិច្ច!', text: 'គាំទ្របងជានិច្ច! បន្តការខិតខំទៀតណា!' },
                  { label: '🇺🇸 Great Stream!', text: 'Awesome stream brother! Keep it up! 🚀' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(chip.text)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Voice AI Selector & Preview */}
              <div className="p-3 rounded-2xl bg-[#1E2128] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-300">Voice AI:</span>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-dark-card border border-white/10 text-xs text-white focus:border-accent-cyan font-semibold"
                  >
                    <option value="khmer_natural">🇰🇭 ស្វ័យប្រវត្ត (Khmer & English Auto)</option>
                    <option value="khmer_female">🇰🇭 ស្រីពៅ (Khmer Female)</option>
                    <option value="khmer_male">🇰🇭 ពិសិដ្ឋ (Khmer Male)</option>
                    <option value="en_natural">🇺🇸 English US Natural AI</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handlePreviewTTS}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-md ${
                    isPlayingTTS
                      ? 'bg-accent-cyan text-black shadow-cyan-500/30'
                      : 'bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isPlayingTTS ? 'Playing...' : 'Test Voice Audio'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-brand-600 via-accent-fuchsia to-accent-cyan hover:brightness-110 active:scale-[0.99] shadow-xl shadow-brand-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" />
                  <span>Send {currency === 'KHR' ? `${Number(amount || 0).toLocaleString()} ៛` : `$${Number(amount || 0).toFixed(2)}`} Tip & Alert</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: RECENT DONATIONS & TOP SUPPORTERS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top 3 Supporters Preview Widget */}
          <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-[#171923] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Top Supporters</h3>
              </div>
              <Link to={`/leaderboard-avatar/${username}`} className="text-[11px] font-bold text-amber-400 hover:text-amber-300">
                View All →
              </Link>
            </div>

            {topSupporters.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Be the first to join the leaderboard!</p>
            ) : (
              <div className="space-y-2">
                {topSupporters.slice(0, 3).map((supporter, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      idx === 0
                        ? 'bg-amber-500/15 border-amber-400/50'
                        : idx === 1
                        ? 'bg-slate-300/10 border-slate-300/30'
                        : 'bg-amber-800/15 border-amber-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                        idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : 'bg-amber-700 text-white'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white truncate">{supporter.donor_name || supporter.name}</span>
                    </div>
                    <span className="text-xs font-black font-mono text-accent-cyan shrink-0 ml-2">
                      ${Number(supporter.total_amount || supporter.total).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Donations Feed */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-[#171923] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-accent-fuchsia" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Recent Donations</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live feed</span>
            </div>

            {recentDonations.length === 0 ? (
              <div className="text-center py-6 space-y-1">
                <p className="text-xs text-slate-400">No donations yet.</p>
                <p className="text-[11px] text-slate-500">Be the first to cheer on @{username}!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#1E2128] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.avatar_url || '/zoee-avatar.png'}
                          alt={item.donor_name}
                          className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0"
                          onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
                        />
                        <span className="text-xs font-bold text-white truncate">{item.donor_name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-accent-cyan shrink-0 ml-2">
                        {item.currency === 'KHR' ? `${Number(item.amount).toLocaleString()} ៛` : `$${Number(item.amount).toFixed(2)}`}
                      </span>
                    </div>
                    {item.message && (
                      <p className="text-[11px] text-slate-300 italic line-clamp-2">
                        "{item.message}"
                      </p>
                    )}
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {getRelativeTime(item.paid_at || item.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1F2B] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-accent-cyan" /> Share Creator Profile
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400">Public Donation Link:</label>
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#13151D] border border-white/10">
                <input
                  type="text"
                  readOnly
                  value={publicShareUrl}
                  className="w-full px-3 py-1.5 bg-transparent text-xs text-brand-300 font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shrink-0 flex items-center gap-1 shadow-md"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(publicShareUrl)}&text=${encodeURIComponent(`Support ${streamer.profile?.display_name || streamer.slug} on Zoee Donation!`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] text-xs font-bold border border-[#229ED9]/30 text-center block transition-all"
              >
                Telegram
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicShareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] text-xs font-bold border border-[#1877F2]/30 text-center block transition-all"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicShareUrl)}&text=${encodeURIComponent(`Send a donation to ${streamer.profile?.display_name || streamer.slug} on Zoee Donation!`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 text-center block transition-all"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYMENT MODAL CHECKOUT */}
      {activePayment && (
        <PaymentModal
          paymentData={activePayment}
          onClose={() => setActivePayment(null)}
          onPaymentSuccess={() => {
            setActivePayment(null);
            // Refresh recent donations
            api.get(`/donations/recent/${username}?limit=8`).then((res) => {
              if (res.success && Array.isArray(res.data)) setRecentDonations(res.data);
            });
          }}
        />
      )}
    </div>
  );
}
