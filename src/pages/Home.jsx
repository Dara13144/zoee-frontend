import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Trophy
} from 'lucide-react';

export default function Home() {
  const [streamers, setStreamers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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

        {/* Quick Search */}
        <div className="mt-12 max-w-md mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
            }}
            className="relative group"
          >
            <input
              type="text"
              placeholder="Search streamer by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-dark-card/90 border border-dark-border focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-white placeholder-slate-500 transition-all shadow-xl group-hover:border-brand-500/40"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-brand-400 transition-colors" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all hover:scale-105"
            >
              Search
            </button>
          </form>
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
