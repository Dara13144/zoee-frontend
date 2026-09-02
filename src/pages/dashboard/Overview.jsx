import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  DollarSign,
  Users,
  Calendar,
  Clock,
  Heart,
  Target,
  ArrowUpRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/streamers/dashboard/stats')
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-3">
        <span className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full"></span>
        Loading channel statistics...
      </div>
    );
  }

  const { metrics, activeGoal, recentDonations, streamer } = data || {};

  return (
    <div className="space-y-8">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-brand-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Raised</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${Number(metrics?.totalReceived || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-accent-emerald flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> All-time earnings
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-accent-cyan/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Today's Total</span>
            <Calendar className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${Number(metrics?.todayTotal || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">24-hour window</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-accent-fuchsia/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>This Month</span>
            <Clock className="w-4 h-4 text-accent-fuchsia" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${Number(metrics?.monthTotal || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">Monthly earnings</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Supporters</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {metrics?.supporterCount || 0}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">{metrics?.totalDonationsCount || 0} total donations</span>
        </div>
      </div>

      {/* Active Goal Highlight */}
      {activeGoal && (
        <div className="glass-panel p-6 rounded-3xl border border-brand-500/25 bg-dark-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{activeGoal.title}</h3>
                <p className="text-xs text-slate-400">Active Live Donation Target</p>
              </div>
            </div>
            <Link to="/dashboard/goals" className="text-xs text-brand-400 hover:text-brand-300 font-bold">
              Manage Goal →
            </Link>
          </div>

          <div className="w-full bg-dark-surface rounded-full h-3 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-brand-500 via-accent-cyan to-accent-emerald h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100))}%`
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span>${Number(activeGoal.current_amount).toFixed(2)} raised</span>
            <span className="text-accent-cyan font-bold">
              {Math.min(100, Math.round((activeGoal.current_amount / activeGoal.target_amount) * 100))}%
            </span>
            <span>Target: ${Number(activeGoal.target_amount).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-400" />
            Recent Donations
          </h3>
          <Link to="/dashboard/donations" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
            View All History →
          </Link>
        </div>

        {recentDonations?.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No donations received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-mono border-b border-white/5">
                <tr>
                  <th className="py-3 px-3">Donor</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Message</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDonations?.map((d) => (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {d.anonymous ? 'Anonymous' : d.donor_name}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-accent-cyan">
                      {d.currency === 'KHR' ? `${Number(d.amount).toLocaleString()} ៛` : `$${Number(d.amount).toFixed(2)}`}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[200px] truncate">
                      {d.message || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {d.payment_method}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.payment_status === 'PAID'
                          ? 'bg-accent-emerald/20 text-accent-emerald border border-emerald-500/30'
                          : d.payment_status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {d.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
