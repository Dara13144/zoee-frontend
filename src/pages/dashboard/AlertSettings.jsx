import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import soundService from '../../services/soundService';
import api from '../../services/api';
import {
  Volume2,
  Sliders,
  Play,
  Copy,
  Check,
  Radio,
  Send,
  Sparkles,
  Trophy,
  Crown,
  Palette,
  Layout,
  Eye,
  Heart,
  AlertCircle,
  Music,
  Disc,
  Video
} from 'lucide-react';

export default function AlertSettings() {
  const { user, streamer } = useAuth();
  const [settings, setSettings] = useState({
    overlay_token: '',
    animation: 'neon',
    sound_url: 'chime',
    sound_volume: 0.8,
    tts_enabled: true,
    tts_speed: 1.0,
    minimum_tts_amount: 1.00,
    duration: 8
  });

  // Top 3 Customizer State
  const [widgetTheme, setWidgetTheme] = useState('amber');
  const [widgetLayout, setWidgetLayout] = useState('vertical');
  const [widgetPeriod, setWidgetPeriod] = useState('all');
  const [widgetAnim, setWidgetAnim] = useState('pulse');
  const [widgetTitle, setWidgetTitle] = useState('Top 3 Channel Supporters');
  const [widgetShowCount, setWidgetShowCount] = useState(true);

  const [copied, setCopied] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState('');

  const identifier = streamer?.slug || user?.username || 'dara_gaming';
  const obsUrl = `${window.location.origin}/alert/${identifier}?token=${settings.overlay_token || identifier}`;

  // Generated Top 3 OBS URL
  const customWidgetUrl = `${window.location.origin}/overlay/supporters/${identifier}?theme=${widgetTheme}&layout=${widgetLayout}&period=${widgetPeriod}&anim=${widgetAnim}&title=${encodeURIComponent(widgetTitle)}&count=${widgetShowCount}`;

  useEffect(() => {
    if (!identifier) return;
    api.get(`/alerts/config/${identifier}`)
      .then(res => {
        if (res.success && res.data.alertSettings) {
          setSettings(res.data.alertSettings);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, [identifier]);

  const copyObsUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWidgetUrl = () => {
    navigator.clipboard.writeText(customWidgetUrl);
    setCopiedWidget(true);
    setMsg('Customized Top 3 OBS URL copied to clipboard!');
    setTimeout(() => {
      setCopiedWidget(false);
      setMsg('');
    }, 3000);
  };

  const handleTestSound = (preset) => {
    soundService.playSound(preset, settings.sound_volume);
  };

  const handleSendTestAlert = async () => {
    setTesting(true);
    try {
      await api.post(`/alerts/test/${identifier}`, {
        streamerSlug: identifier,
        donorName: 'Zoee Supafan',
        amount: 10.00,
        currency: 'USD',
        message: 'This is a live test donation alert from your Zoee dashboard! 🚀❤️'
      });
      setMsg('Test alert sent to OBS overlay successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to broadcast test alert: ' + (err.message || 'Unknown error'));
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestSongAlert = async (songUrl = 'https://www.youtube.com/watch?v=kJQP7kiw5Fk') => {
    setTesting(true);
    try {
      await api.post(`/alerts/test/${identifier}`, {
        streamerSlug: identifier,
        donorName: 'Music Lover 🎵',
        amount: 5.00,
        currency: 'USD',
        message: 'Playing VannDa - Time To Rise! Keep streaming! 🔥❤️',
        mediaUrl: songUrl
      });
      setMsg('🎵 Live Song Alert sent to OBS overlay successfully! Check your OBS stream!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to broadcast test song alert: ' + (err.message || 'Unknown error'));
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/alerts/config', settings);
      if (res.success) {
        setMsg('Alert settings saved successfully!');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Mockup Data for Live Preview in Studio
  const previewSupporters = [
    { rank: 1, name: 'Sokha MLBB Fan', total: 120.00, count: 5 },
    { rank: 2, name: 'Vibol ProGamer', total: 75.00, count: 3 },
    { rank: 3, name: 'Chanthea Live', total: 45.00, count: 2 }
  ];

  // Preview Theme Colors
  const previewThemeColors = {
    amber: {
      border: 'border-amber-500/60',
      badge: 'bg-gradient-to-tr from-amber-400 to-amber-200 text-black',
      headerIcon: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
      accent: 'text-amber-300'
    },
    cyan: {
      border: 'border-cyan-500/60',
      badge: 'bg-gradient-to-tr from-cyan-400 to-blue-200 text-black',
      headerIcon: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40',
      accent: 'text-cyan-300'
    },
    violet: {
      border: 'border-brand-500/60',
      badge: 'bg-gradient-to-tr from-brand-400 to-accent-fuchsia text-white',
      headerIcon: 'text-brand-400 bg-brand-500/20 border-brand-500/40',
      accent: 'text-brand-300'
    },
    emerald: {
      border: 'border-emerald-500/60',
      badge: 'bg-gradient-to-tr from-emerald-400 to-teal-200 text-black',
      headerIcon: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
      accent: 'text-emerald-300'
    },
    rose: {
      border: 'border-rose-500/60',
      badge: 'bg-gradient-to-tr from-rose-500 to-amber-300 text-white',
      headerIcon: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
      accent: 'text-rose-300'
    }
  }[widgetTheme] || {
    border: 'border-amber-500/60',
    badge: 'bg-gradient-to-tr from-amber-400 to-amber-200 text-black',
    headerIcon: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
    accent: 'text-amber-300'
  };

  return (
    <div className="space-y-8">
      {/* 1. OBS Browser Source Pop-up Alert URL */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 bg-dark-card space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Pop-up Donation Alert (OBS Source)</h2>
              <p className="text-xs text-slate-400">Add as a Browser Source (Width: 800, Height: 600, 100% Transparent)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendTestAlert}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-accent-fuchsia hover:brightness-110 shadow-lg transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              {testing ? 'Sending...' : 'Test Alert'}
            </button>
            <button
              type="button"
              onClick={() => handleSendTestSongAlert('https://www.youtube.com/watch?v=kJQP7kiw5Fk')}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-cyan to-brand-600 hover:brightness-110 shadow-lg transition-all shrink-0"
            >
              <Music className="w-3.5 h-3.5" />
              {testing ? 'Playing...' : 'Test Song on OBS 🎵'}
            </button>
          </div>
        </div>

        <div className="flex rounded-2xl overflow-hidden border border-dark-border bg-dark-surface p-1.5">
          <input
            type="text"
            readOnly
            value={obsUrl}
            className="w-full px-3 py-2 bg-transparent text-xs text-slate-300 font-mono focus:outline-none select-all"
          />
          <button
            onClick={copyObsUrl}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-accent-emerald" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Alert URL'}
          </button>
          <a
            href={obsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10 flex items-center gap-1.5 shrink-0 ml-1.5"
            title="Preview Live Alert Overlay in new tab"
          >
            <Eye className="w-4 h-4 text-accent-cyan" />
            <span className="text-xs font-bold hidden sm:inline">Preview</span>
          </a>
        </div>
      </div>

      {/* 🎵 Song Request (Media Share) OBS Live Testing Hub */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-accent-cyan/30 bg-dark-card space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
              <Disc className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Live Stream Song Request System</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                  OBS Media Share
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                When donors attach songs or YouTube tracks to their tip, the song automatically plays live on your OBS overlay with an animated equalizer visualizer!
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-accent-cyan" /> Test on OBS:
          </span>
          <button
            type="button"
            onClick={() => handleSendTestSongAlert('https://www.youtube.com/watch?v=kJQP7kiw5Fk')}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-accent-cyan/20 hover:bg-accent-cyan/30 border border-accent-cyan/40 transition-all shadow-md active:scale-95"
          >
            <Play className="w-3 h-3 text-accent-cyan" /> 🇰🇭 VannDa - Time To Rise
          </button>
          <button
            type="button"
            onClick={() => handleSendTestSongAlert('https://www.youtube.com/watch?v=fJ9rUzIMcZQ')}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 transition-all shadow-md active:scale-95"
          >
            <Play className="w-3 h-3 text-brand-300" /> 🇰🇭 G-Devith - Tep Phnor
          </button>
          <button
            type="button"
            onClick={() => handleSendTestSongAlert('https://www.youtube.com/watch?v=jfKfPfyJRdk')}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-accent-fuchsia/20 hover:bg-accent-fuchsia/30 border border-accent-fuchsia/40 transition-all shadow-md active:scale-95"
          >
            <Play className="w-3 h-3 text-accent-fuchsia" /> ✨ Chill Lo-Fi Beat
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald font-semibold text-center animate-pulse">
          {msg}
        </div>
      )}

      {/* 2. Top 3 Supporters Customizer & Live Studio */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 bg-dark-card space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Custom Top 3 Donation Studio (OBS Widget)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NEW
                </span>
              </h2>
              <p className="text-xs text-slate-400">Customize layout, themes, headers, and animations for your Top 3 OBS overlay</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={customWidgetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview in New Tab
            </a>
          </div>
        </div>

        {/* Customizer Controls & Live Interactive Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Customizer Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Widget Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Custom Header Title</label>
              <input
                type="text"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                placeholder="e.g. Top 3 Stream Champions"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-amber-500 font-semibold"
              />
            </div>

            {/* Theme & Layout Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" /> Color Theme
                </label>
                <select
                  value={widgetTheme}
                  onChange={(e) => setWidgetTheme(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-amber-500"
                >
                  <option value="amber">🏆 Gold Amber (Default)</option>
                  <option value="violet">💜 Zoee Cyber Violet</option>
                  <option value="cyan">⚡ Neon Ice Cyan</option>
                  <option value="emerald">🟢 Matrix Emerald</option>
                  <option value="rose">🔥 Crimson Ruby Fire</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-amber-400" /> Layout Style
                </label>
                <select
                  value={widgetLayout}
                  onChange={(e) => setWidgetLayout(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-amber-500"
                >
                  <option value="vertical">Vertical Podium Card (Compact)</option>
                  <option value="horizontal">Horizontal Ribbon Ticker</option>
                </select>
              </div>
            </div>

            {/* Period & Animation Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Timeframe Period</label>
                <select
                  value={widgetPeriod}
                  onChange={(e) => setWidgetPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-amber-500"
                >
                  <option value="all">All-Time Top 3</option>
                  <option value="month">This Month's Top 3</option>
                  <option value="week">This Week's Top 3</option>
                  <option value="today">Today's 24h Top 3</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Badge Animation</label>
                <select
                  value={widgetAnim}
                  onChange={(e) => setWidgetAnim(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-amber-500"
                >
                  <option value="pulse">Soft Pulse</option>
                  <option value="bounce">Crown Bounce</option>
                  <option value="glow">Cyber Neon Glow</option>
                  <option value="none">Static (No Animation)</option>
                </select>
              </div>
            </div>

            {/* Toggle Show Count */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-dark-surface border border-dark-border">
              <div>
                <p className="text-xs font-bold text-white">Show Donor Donation Count</p>
                <p className="text-[11px] text-slate-400">Displays total number of tips made under donor name</p>
              </div>
              <input
                type="checkbox"
                checked={widgetShowCount}
                onChange={(e) => setWidgetShowCount(e.target.checked)}
                className="w-4 h-4 rounded border-dark-border bg-dark-card text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Live Interactive Visual Mockup (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#090a0f]/90 border border-white/10 shadow-inner space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-400" /> Live Stream Preview
            </span>

            {/* Vertical Preview Card */}
            {widgetLayout === 'vertical' ? (
              <div className={`w-full max-w-[280px] glass-panel bg-dark-card/95 border-2 ${previewThemeColors.border} rounded-3xl p-4 space-y-3 shadow-2xl`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${previewThemeColors.headerIcon}`}>
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white leading-tight truncate max-w-[150px]">
                        {widgetTitle || "Top 3 Supporters"}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-mono">@{identifier}</p>
                    </div>
                  </div>
                  <Crown className={`w-4 h-4 ${previewThemeColors.accent} ${widgetAnim === 'bounce' ? 'animate-bounce' : widgetAnim === 'pulse' ? 'animate-pulse' : ''}`} />
                </div>

                <div className="space-y-2">
                  {previewSupporters.map((s, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-xl border ${
                        idx === 0
                          ? 'bg-amber-500/15 border-amber-400 shadow-sm'
                          : idx === 1
                          ? 'bg-slate-300/10 border-slate-300/30'
                          : 'bg-amber-800/10 border-amber-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                          idx === 0 ? previewThemeColors.badge : idx === 1 ? 'bg-slate-300 text-black' : 'bg-amber-700 text-white'
                        }`}>
                          {idx === 0 ? <Crown className="w-3 h-3 fill-current" /> : `#${s.rank}`}
                        </div>
                        <div className="truncate">
                          <span className="text-[11px] font-bold text-white truncate block">{s.name}</span>
                          {widgetShowCount && (
                            <span className="text-[8px] text-slate-400">{s.count} tips</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-accent-cyan">${s.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span className="text-accent-emerald font-bold">● LIVE PODIUM</span>
                  <span>Zoee Donation</span>
                </div>
              </div>
            ) : (
              /* Horizontal Ribbon Preview */
              <div className={`w-full glass-panel bg-dark-card/95 border-2 ${previewThemeColors.border} rounded-2xl p-2.5 flex items-center gap-2 shadow-xl`}>
                <Crown className={`w-4 h-4 ${previewThemeColors.accent} shrink-0`} />
                <div className="flex items-center gap-2 overflow-hidden text-[10px]">
                  {previewSupporters.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-dark-surface px-2 py-1 rounded-lg border border-white/5 shrink-0">
                      <span className="font-bold text-amber-300">#{s.rank}</span>
                      <span className="text-white truncate max-w-[60px]">{s.name}</span>
                      <span className="font-mono text-accent-cyan">${s.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customized OBS URL Output & Copy Button */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <label className="text-xs font-bold text-amber-300 uppercase font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Your Customized Top 3 OBS URL
          </label>
          <div className="flex rounded-2xl overflow-hidden border border-amber-500/40 bg-dark-surface p-1.5 shadow-inner">
            <input
              type="text"
              readOnly
              value={customWidgetUrl}
              className="w-full px-3 py-2 bg-transparent text-xs text-amber-200 font-mono focus:outline-none select-all"
            />
            <button
              onClick={copyWidgetUrl}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-xs font-bold text-black flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              {copiedWidget ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
              {copiedWidget ? 'Copied!' : 'Copy Customized URL'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            OBS Studio Settings: Width: {widgetLayout === 'vertical' ? '400' : '800'}, Height: {widgetLayout === 'vertical' ? '480' : '140'} (100% Transparent Background)
          </p>
        </div>
      </div>

      {/* 3. Pop-up Alert Customization & Soundboard Studio */}
      <form onSubmit={handleSaveSettings} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          Pop-up Alert Customization & Soundboard
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Animation Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Alert Animation</label>
            <select
              value={settings.animation}
              onChange={(e) => setSettings({ ...settings, animation: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
            >
              <option value="neon">Neon Cyber Glow (Default)</option>
              <option value="bounce">Bouncy Pop-in</option>
              <option value="slide">Smooth Slide Right</option>
              <option value="fade">Elegant Fade In</option>
              <option value="zoom">Dynamic Zoom Punch</option>
            </select>
          </div>

          {/* Sound Preset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase">Alert Audio Preset</label>
              <button
                type="button"
                onClick={() => handleTestSound(settings.sound_url)}
                className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Test Sound
              </button>
            </div>
            <select
              value={settings.sound_url}
              onChange={(e) => setSettings({ ...settings, sound_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
            >
              <option value="chime">Cosmic Chime (Default)</option>
              <option value="ding">Arcade Bell Ding</option>
              <option value="cash">Cash Register Ka-Ching</option>
              <option value="fanfare">Victory Fanfare</option>
              <option value="neon">Neon Sci-Fi Swoosh</option>
            </select>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase">Volume</label>
              <span className="text-xs font-mono text-slate-400">{Math.round(settings.sound_volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sound_volume}
              onChange={(e) => setSettings({ ...settings, sound_volume: parseFloat(e.target.value) })}
              className="w-full accent-brand-500"
            />
          </div>

          {/* Display Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase">Alert Duration (Seconds)</label>
              <span className="text-xs font-mono text-slate-400">{settings.duration}s</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={settings.duration}
              onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value, 10) })}
              className="w-full accent-brand-500"
            />
          </div>
        </div>

        {/* Text-to-Speech (TTS) Settings */}
        <div className="pt-4 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-accent-cyan" />
                Text-to-Speech (TTS) Engine
              </h4>
              <p className="text-xs text-slate-400">Reads donor messages out loud on stream with anti-overlap queue</p>
            </div>
            <input
              type="checkbox"
              checked={settings.tts_enabled}
              onChange={(e) => setSettings({ ...settings, tts_enabled: e.target.checked })}
              className="w-5 h-5 rounded border-dark-border bg-dark-surface text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          {settings.tts_enabled && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Voice Model Selector */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Voice AI Language & Persona (សំឡេងអាន)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        ttsService.previewVoice(
                          'សួស្តី! អរគុណសម្រាប់ការឧបត្ថម្ភ និងការគាំទ្រដល់ការផ្សាយផ្ទាល់!',
                          settings.tts_voice || 'khmer_natural'
                        );
                      }}
                      className="text-[11px] font-semibold text-accent-cyan hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Test Khmer AI (សាកល្បង)
                    </button>
                  </div>
                  <select
                    value={settings.tts_voice || 'khmer_natural'}
                    onChange={(e) => setSettings({ ...settings, tts_voice: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500 font-semibold"
                  >
                    <option value="khmer_natural">🇰🇭 ស្វ័យប្រវត្ត (Auto-Detect Khmer & English)</option>
                    <option value="khmer_female">🇰🇭 សំឡេងស្រី ស្រីពៅ (Khmer Female Sreypov)</option>
                    <option value="khmer_male">🇰🇭 សំឡេងប្រុស ពិសិដ្ឋ (Khmer Male Piseth)</option>
                    <option value="en_natural">🇺🇸 English US Natural AI</option>
                  </select>
                </div>

                {/* Min Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Min. Donation ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={settings.minimum_tts_amount}
                    onChange={(e) => setSettings({ ...settings, minimum_tts_amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white font-mono focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Custom Thank-You Template Studio */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Custom Thank-You Speech Template (ទម្រង់សារថ្លែងអំណរគុណ)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      ttsService.stop();
                      ttsService.speak({
                        text: 'សួស្តីបង! សូមឲ្យការផ្សាយផ្ទាល់ទទួលបានជោគជ័យ!',
                        donorName: 'Sokha Fan',
                        amount: '10',
                        currency: 'USD',
                        voice: settings.tts_voice || 'khmer_natural',
                        template: settings.tts_template || '{donorName} បានឧបត្ថម្ភ {amount}។ អរគុណសម្រាប់ការគាំទ្រ! {message}',
                        streamerName: identifier,
                        minAmount: 0
                      });
                    }}
                    className="text-[11px] font-semibold text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Preview Custom Template (ស្តាប់សារ)
                  </button>
                </div>

                <input
                  type="text"
                  value={settings.tts_template || ''}
                  onChange={(e) => setSettings({ ...settings, tts_template: e.target.value })}
                  placeholder="{donorName} បានឧបត្ថម្ភ {amount}។ អរគុណសម្រាប់ការគាំទ្រ! {message}"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500 font-mono"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, tts_template: '{donorName} បានឧបត្ថម្ភ {amount}។ អរគុណច្រើនសម្រាប់ការគាំទ្រ! សារ៖ {message}' })}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    🇰🇭 Khmer Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, tts_template: 'អរគុណបង {donorName} សម្រាប់ការឧបត្ថម្ភ {amount}! ជូនពរសំណាងល្អ! {message}' })}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    🇰🇭 Khmer Blessing
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, tts_template: 'Thank you {donorName} for donating {amount}! Message: {message}' })}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    🇺🇸 English Standard
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  Placeholders: <span className="text-brand-300 font-bold">{`{donorName}`}</span>, <span className="text-brand-300 font-bold">{`{amount}`}</span>, <span className="text-brand-300 font-bold">{`{message}`}</span>
                </p>
              </div>

              {/* Speed / Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Speech Rate (ល្បឿនអាន)</label>
                  <span className="text-xs font-mono text-slate-400">{settings.tts_speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={settings.tts_speed}
                  onChange={(e) => setSettings({ ...settings, tts_speed: parseFloat(e.target.value) })}
                  className="w-full accent-accent-cyan"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all"
        >
          {saving ? 'Saving...' : 'Save Alert Settings'}
        </button>
      </form>
    </div>
  );
}
