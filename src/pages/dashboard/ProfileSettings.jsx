import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Sliders, User, DollarSign, Image, Save, Check } from 'lucide-react';

export default function ProfileSettings() {
  const { user, streamer, refreshSession } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(user?.banner_url || '');
  const [minDonation, setMinDonation] = useState(streamer?.min_donation_amount || 1.00);
  const [currency, setCurrency] = useState(streamer?.currency || 'USD');
  const [abaPaywayLink, setAbaPaywayLink] = useState(streamer?.aba_payway_link || '');
  const [abaQrUrl, setAbaQrUrl] = useState(streamer?.aba_qr_url || '');
  const [donationEnabled, setDonationEnabled] = useState(streamer?.donation_enabled !== false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const res = await api.put('/streamers/settings', {
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        min_donation_amount: parseFloat(minDonation),
        currency,
        aba_payway_link: abaPaywayLink,
        aba_qr_url: abaQrUrl,
        donation_enabled: donationEnabled
      });

      if (res.success) {
        setMsg('Profile & payment preferences saved successfully!');
        await refreshSession();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-brand-400" />
          Streamer Profile & Payment Preferences
        </h2>
        <p className="text-xs text-slate-400">Customize how your public donation page looks and functions</p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald font-semibold text-center">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Min. Donation ($ USD)</label>
            <input
              type="number"
              min="0.10"
              step="0.10"
              required
              value={minDonation}
              onChange={(e) => setMinDonation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white font-mono focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase">Bio / Description</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-4 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Banner Image URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500"
            />
          </div>
        </div>

        {/* ABA PayWay Tip Link & QR Code Setup */}
        <div className="p-6 rounded-2xl bg-dark-surface/90 border border-brand-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-xs">
                ABA
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">ABA PayWay Tip Link & Personal QR</h4>
                <p className="text-xs text-slate-400">Add your custom ABA PayWay link or merchant QR for direct donor transfers</p>
              </div>
            </div>
            {abaPaywayLink && (
              <a
                href={abaPaywayLink.startsWith('http') ? abaPaywayLink : `https://${abaPaywayLink}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-brand-300 hover:text-brand-200 underline"
              >
                Test Link ↗
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">
                ABA PayWay Direct Tip Link
              </label>
              <input
                type="url"
                value={abaPaywayLink}
                onChange={(e) => setAbaPaywayLink(e.target.value)}
                placeholder="https://link.payway.com.kh/YOUR_LINK"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-mono placeholder-slate-600 focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">
                ABA / KHQR Static QR Code Image (URL)
              </label>
              <input
                type="url"
                value={abaQrUrl}
                onChange={(e) => setAbaQrUrl(e.target.value)}
                placeholder="https://.../my_aba_qr.png"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white placeholder-slate-600 focus:border-brand-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Donors will see a direct "Open in ABA Mobile" button and QR display during checkout.
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-surface border border-dark-border">
          <div>
            <p className="text-sm font-bold text-white">Accepting Donations</p>
            <p className="text-xs text-slate-400">Toggle whether visitors can submit new donations to your page</p>
          </div>
          <input
            type="checkbox"
            checked={donationEnabled}
            onChange={(e) => setDonationEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-dark-border bg-dark-card text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile Preferences'}
        </button>
      </form>
    </div>
  );
}
