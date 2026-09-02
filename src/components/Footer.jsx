import React from 'react';
import { Heart, ShieldCheck, Zap, Radio, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07080c] py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ZOEE DONATION</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Empowering Cambodian content creators, streamers, and esports casters with instant ABA PayWay and Bakong KHQR tipping.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link to="/search" className="hover:text-brand-400 transition-colors">Find Streamers</Link></li>
            <li><Link to="/become-streamer" className="hover:text-brand-400 transition-colors">Start Streaming</Link></li>
            <li><Link to="/login" className="hover:text-brand-400 transition-colors">Creator Login</Link></li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Payment Gateways</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>ABA PayWay v2 (HMAC-SHA512)</li>
            <li>Bakong KHQR (EMVCo QR)</li>
            <li>Wing Bank QR</li>
            <li>TrueMoney Wallet</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
        <p>© 2026 Zoee Donation Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
