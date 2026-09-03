import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Heart,
  Zap,
  ShieldCheck,
  Smartphone,
  Radio,
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Volume2,
  Users,
  Trophy,
  Copy,
  Check,
  Link as LinkIcon
} from 'lucide-react';

export default function Home() {
  const [streamers, setStreamers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/streamers/search'),
      api.get('/leaderboard/global?period=all')
    ]).then(([streamerRes, leaderRes]) => {
      if (streamerRes.success) setStreamers(streamerRes.data);
      if (leaderRes.success) setLeaderboard(leaderRes.data.rankings || []);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleCopyTipLink = (slug) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const link = `${origin}/tip/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleQuickTipSubmit = (e) => {
    e.preventDefault();
    const clean = searchQuery.trim().replace(/^@/, '');
    if (clean) {
      navigate(`/tip/${clean}`);
    }
  };

  return (
    <div className="space-y-24 pb-16 relative overflow-hidden">
      {/* Ambient Animated Blobs */}
      <div className="ambient-glow-1 top-10 -left-20 animate-blob" />
      <div className="ambient-glow-2 top-80 -right-20 animate-blob animation-delay-2000" />
      <div className="ambient-glow-3 bottom-40 left-1/3 animate-blob animation-delay-4000" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Central Pulse Ambient Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-brand-600/30 via-accent-cyan/20 to-accent-fuchsia/20 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse hover:scale-105 transition-transform cursor-default">
          <Sparkles className="w-4 h-4 text-accent-cyan animate-spin-slow" />
          The Premier Live Donation Platform for Cambodia
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight animate-float">
          Support Creators With{' '}
          <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-fuchsia bg-clip-text text-transparent animate-gradient-x">
            Instant KHQR & ABA PayWay
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Sub-second OBS alert popups, realistic Text-to-Speech (TTS), interactive donation goals, and instant Telegram alerts for Cambodian live streamers.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/search"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-brand-600 via-accent-fuchsia to-accent-cyan hover:scale-105 active:scale-95 shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group btn-shimmer"
          >
            <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
            Explore Creators & Donate
          </Link>
          <Link
            to="/become-streamer"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-200 glass-card hover:border-brand-500/50 hover:bg-white/5 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Radio className="w-5 h-5 text-accent-cyan animate-pulse" />
            Start as a Streamer
          </Link>
        </div>

        {/* ⚡ Quick Tip Link Jump & Search */}
        <div className="mt-10 max-w-xl mx-auto">
          <form
            onSubmit={handleQuickTipSubmit}
            className="relative group flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl bg-dark-card/90 border border-brand-500/30 shadow-2xl focus-within:border-brand-500 transition-all"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
              <input
                type="text"
                placeholder="Enter creator username to tip (e.g. @dara_gaming)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-3 py-3 rounded-xl bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-1.5 px-1 pb-1 sm:pb-0">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-1.5 hover:scale-105"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Go to Tip Link</span>
              </button>
            </div>
          </form>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Direct Link Format: <span className="text-brand-400 font-bold">zoee.me/tip/@streamer</span> or <span className="text-accent-cyan font-bold">zoee.me/@streamer</span>
          </p>
        </div>

        {/* Live Animated Community Ticker */}
        <div className="mt-12 overflow-hidden rounded-2xl bg-dark-card/80 border border-white/10 p-2.5 backdrop-blur-md max-w-3xl mx-auto shadow-inner relative group">
          <div className="animate-marquee flex items-center gap-6 whitespace-nowrap text-xs">
            <span className="flex items-center gap-1.5 text-accent-cyan font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping"></span>
              ⚡ <strong>Sokha</strong> sent <strong>$15.00</strong> to <strong>@dara_gaming</strong>
            </span>
            <span className="text-slate-600">✦</span>
            <span className="flex items-center gap-1.5 text-accent-fuchsia font-semibold">
              🎉 <strong>Piseth</strong> sent <strong>$50.00</strong> to <strong>@sreyneang_live</strong>
            </span>
            <span className="text-slate-600">✦</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              👑 <strong>Bora</strong> unlocked <strong>#1 Champion Supporter</strong>
            </span>
            <span className="text-slate-600">✦</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              ✨ <strong>Chanthy</strong> contributed <strong>$20.00</strong> to Goal
            </span>
            <span className="text-slate-600">✦</span>
            <span className="flex items-center gap-1.5 text-accent-cyan font-semibold">
              ⚡ <strong>Sokha</strong> sent <strong>$15.00</strong> to <strong>@dara_gaming</strong>
            </span>
            <span className="text-slate-600">✦</span>
            <span className="flex items-center gap-1.5 text-accent-fuchsia font-semibold">
              🎉 <strong>Piseth</strong> sent <strong>$50.00</strong> to <strong>@sreyneang_live</strong>
            </span>
            <span className="text-slate-600">✦</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              👑 <strong>Bora</strong> unlocked <strong>#1 Champion Supporter</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ⚡ FEATURED CREATORS & DIRECT TIP LINKS SHOWCASE */}
      {streamers && streamers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-extrabold uppercase tracking-wider border border-brand-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Instant Live Tipping
                </span>
                <span className="text-xs text-slate-400 font-mono">Realtime Bakong & PayWay</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Featured Creators & Tip Links</h2>
              <p className="text-xs sm:text-sm text-slate-400">Click any creator's tip link to send instant tips, messages, and TTS alerts</p>
            </div>

            <Link
              to="/search"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 hover:border-brand-500/40 transition-all flex items-center gap-1.5"
            >
              <span>Explore All Creators</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streamers.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="glass-card rounded-3xl overflow-hidden border border-brand-500/25 hover:border-brand-500/60 transition-all duration-300 group flex flex-col justify-between hover:shadow-[0_15px_35px_rgba(139,92,246,0.2)] bg-[#121420]/90 backdrop-blur-xl"
              >
                <div>
                  {/* Banner */}
                  <div className="relative h-32 bg-slate-800 overflow-hidden">
                    <img
                      src={s.profile?.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}
                      alt={s.slug}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121420] via-transparent to-black/30"></div>
                    
                    {/* Avatar */}
                    <div className="absolute -bottom-4 left-6">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-500 shadow-xl bg-dark-card">
                        <img
                          src={s.profile?.avatar_url || '/zoee-avatar.png'}
                          alt={s.slug}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = '/zoee-avatar.png'; }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Accepting Tips
                    </div>
                  </div>

                  {/* Profile info */}
                  <div className="p-6 pt-7 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors flex items-center gap-1.5">
                          {s.profile?.display_name || s.slug}
                        </h3>
                        <p className="text-xs text-brand-400 font-mono font-semibold">@{s.slug}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-accent-cyan bg-accent-cyan/10 px-2.5 py-1 rounded-lg border border-accent-cyan/20">
                        ${Number(s.total_received || 0).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {s.profile?.bio || 'Full-time streamer on Zoee Donation. Support the stream with live alerts!'}
                    </p>

                    {/* Tip Link Pill */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-300">
                      <span className="truncate text-slate-400">/tip/{s.slug}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyTipLink(s.slug)}
                        className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 shrink-0 ml-2"
                      >
                        {copiedSlug === s.slug ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-6 pt-0 border-t border-white/5 flex items-center gap-2 mt-4">
                  <Link
                    to={`/tip/${s.slug}`}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/25 hover:scale-[1.02]"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Send Tip</span>
                  </Link>

                  <Link
                    to={`/leaderboard-avatar/${s.slug}`}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 glass-card hover:bg-white/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-1"
                    title="View Leaderboard"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Built Specifically For Cambodian Streamers</h2>
          <p className="text-slate-400 text-sm mt-2">Every feature optimized for live broadcasts on Facebook Gaming, YouTube, and TikTok</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-brand-500/20 hover:border-brand-500/60 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(139,92,246,0.25)] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">ABA PayWay & Bakong KHQR</h3>
            <p className="text-sm text-slate-400">
              Donors scan with any Cambodian banking app (ABA, Wing, ACLEDA, Canadia) with automated sub-second verification.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-accent-cyan/20 hover:border-accent-cyan/60 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(6,182,212,0.25)] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time OBS Browser Source</h3>
            <p className="text-sm text-slate-400">
              Plug your unique overlay URL into OBS Studio or Streamlabs. Alerts trigger with custom animations and audio chimes instantly.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-accent-fuchsia/20 hover:border-accent-fuchsia/60 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(217,70,239,0.25)] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-accent-fuchsia/10 border border-accent-fuchsia/30 flex items-center justify-center text-accent-fuchsia">
              <Volume2 className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Text-to-Speech (TTS)</h3>
            <p className="text-sm text-slate-400">
              XSS-sanitized donation messages read out in clear Khmer AI and English voice with anti-overlap queue management.
            </p>
          </div>
        </div>
      </section>

      {/* Global Leaderboard Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-brand-500/20 bg-dark-card/90">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Top Platform Supporters</h2>
                <p className="text-xs text-slate-400">Honoring the community members driving Cambodian creator growth</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-dark-surface/60 border border-white/5 hover:border-brand-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/40'
                        : idx === 1
                        ? 'bg-slate-300 text-black'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    #{item.rank}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400">{item.donation_count} donations</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-black text-accent-cyan">
                  ${Number(item.total).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
