import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Search, Shield, LayoutDashboard, LogOut, User, Menu, X, Sparkles, PlusCircle, Zap, Copy, Check } from 'lucide-react';

export default function Navbar() {
  const { user, streamer, isAuthenticated, isAdmin, isStreamer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedMyTip, setCopiedMyTip] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCopyMyTip = (e) => {
    e.stopPropagation();
    const slug = streamer?.slug || user?.username;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    navigator.clipboard.writeText(`${origin}/tip/${slug}`);
    setCopiedMyTip(true);
    setTimeout(() => setCopiedMyTip(false), 2000);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 bg-[#090a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300 border border-brand-500/40 bg-[#090a0f] flex items-center justify-center">
              <img src="/zoee-logo.png" alt="Zoee Donation Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
                  ZOEE<span className="text-brand-400 font-extrabold ml-1">DONATION</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot"></span>
                  LIVE
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-widest uppercase -mt-0.5">Live Creator Support</span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/search" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
              <Search className="w-4 h-4 text-brand-400" />
              Explore Creators
            </Link>

            <Link
              to="/tip"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all shadow-sm hover:scale-105"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Send a Tip</span>
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full glass-card hover:border-brand-500/50 transition-all text-left"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user.display_name}
                    className="w-8 h-8 rounded-full object-cover border border-brand-500/40"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200 leading-tight">{user.display_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">@{user.username}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl glass-panel bg-dark-card border border-dark-border shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-dark-border">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {user.role}
                      </span>
                    </div>

                    {isStreamer ? (
                      <>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-brand-500/20 hover:text-brand-300"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-400" />
                          Streamer Dashboard
                        </Link>
                        <button
                          type="button"
                          onClick={handleCopyMyTip}
                          className="w-full flex items-center justify-between px-4 py-2 text-xs text-amber-300 hover:bg-amber-500/15 transition-colors text-left font-semibold"
                        >
                          <span className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            Copy My Tip Link
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {copiedMyTip ? 'Copied! ✅' : 'Copy'}
                          </span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/become-streamer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-accent-cyan hover:bg-accent-cyan/10"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Become a Streamer
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-accent-rose hover:bg-accent-rose/10"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left border-t border-dark-border mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors hover:bg-white/5"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-fuchsia hover:from-brand-500 hover:to-accent-fuchsia/90 px-4 py-2 rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#090a0f]/95 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-white/5"
          >
            Explore Creators
          </Link>

          <Link
            to="/tip"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-300 bg-amber-500/10 font-bold"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            Send a Tip
          </Link>

          {isAuthenticated ? (
            <>
              {isStreamer && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-brand-300 bg-brand-500/10 font-semibold"
                  >
                    Streamer Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleCopyMyTip}
                    className="w-full text-left px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-500/10 text-xs font-semibold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Copy My Tip Link
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{copiedMyTip ? 'Copied!' : 'Copy'}</span>
                  </button>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-rose-300 bg-rose-500/10 font-semibold"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg bg-white/5 text-white"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg bg-brand-600 text-white font-semibold"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
