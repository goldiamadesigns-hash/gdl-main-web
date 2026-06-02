/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './StoreContext';
import { Storefront } from './components/Storefront';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { TypographyStyleInjector } from './components/TypographyStyleInjector';
import { ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';

function AppContent() {
  const { isAdminLoggedIn } = useStore();
  const [currentView, setCurrentView] = useState<'storefront' | 'admin-login' | 'admin-dashboard'>('storefront');

  // Hide Operator Link trigger logic & hotkeys handler
  useEffect(() => {
    const handleUrlGateway = () => {
      const targetQuery = window.location.search.includes('admin=true') || window.location.hash.includes('admin') || window.location.hash.includes('login') || window.location.hash.includes('operator');
      if (targetQuery) {
        if (isAdminLoggedIn) {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('admin-login');
        }
      }
    };

    // Check query params on load
    handleUrlGateway();
    window.addEventListener('hashchange', handleUrlGateway);

    // Keyboard combination shortcut loader: Ctrl+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isAdminLoggedIn) {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('admin-login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Write a system instructions notice in console so tests/users know how to access
    console.log(
      "%c🔒 GOLDIAMA AUTHENTICATOR GATEWAY ACTIVATED\n" +
      "%cTo access the hidden Operator Panel:\n" +
      "1. Press [ Ctrl + Shift + A ] (or Cmd+Shift+A)\n" +
      "2. Tap the Store Logo 5 times\n" +
      "3. Append ?admin=true or #admin to the checkout URL state.",
      "color: #d97706; font-weight: bold; font-size: 13px;",
      "color: #71717a; font-size: 11px;"
    );

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleUrlGateway);
    };
  }, [isAdminLoggedIn]);

  // Listen to admin state changes contextually
  useEffect(() => {
    if (isAdminLoggedIn && currentView === 'admin-login') {
      setCurrentView('admin-dashboard');
    } else if (!isAdminLoggedIn && currentView === 'admin-dashboard') {
      setCurrentView('storefront');
    }
  }, [isAdminLoggedIn, currentView]);

  return (
    <div id="application-content-host" className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100 flex flex-col justify-between">
      
      {/* 1. VIEW SWITCHER HERO CONVERT BAR */}
      {currentView !== 'storefront' && (
        <div id="admin-header-override" className="bg-[#18181B] text-zinc-200">
          <div className="max-w-7xl mx-auto px-5 h-12 flex justify-between items-center text-xs font-mono">
            <button
              onClick={() => {
                setCurrentView('storefront');
              }}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[11px] uppercase tracking-wider font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return To Storefront
            </button>

            <div className="flex items-center gap-2 select-none">
              <Terminal className="w-4 h-4 text-zinc-400 stroke-[1.5]" />
              <span className="text-zinc-400 text-[10px] tracking-widest hidden sm:inline">OVERLAY COCKPIT LINK SECURE</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHOSEN COMPONENT GRAPH ROUTER */}
      <div id="view-renderer-mount" className="flex-1 animate-[fadeIn_0.35s_ease-out]">
        {currentView === 'storefront' && (
          <Storefront 
            onAdminTrigger={() => {
              if (isAdminLoggedIn) {
                setCurrentView('admin-dashboard');
              } else {
                setCurrentView('admin-login');
              }
            }} 
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLogin 
            onSuccess={() => {
              setCurrentView('admin-dashboard');
            }} 
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard />
        )}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <TypographyStyleInjector />
      <AppContent />
    </StoreProvider>
  );
}
