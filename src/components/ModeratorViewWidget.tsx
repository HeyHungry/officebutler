import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Edit3, Settings, LogOut } from 'lucide-react';
import { useModerator } from '../contexts/ModeratorContext';

export function ModeratorViewWidget() {
  const { isAuthenticated, isModeratorView, toggleModeratorView, openCentralDashboard, logoutModerator } = useModerator();

  // Alleen zichtbaar wanneer de gebruiker is ingelogd als moderator
  if (!isAuthenticated) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-5 left-5 z-40 select-none font-sans"
      >
        <div className="bg-[#151f34] text-white rounded-full pl-3 pr-2 py-1.5 shadow-2xl border border-[#b58b4c]/70 flex items-center gap-2.5 backdrop-blur-md">
          {/* Moderator Icon */}
          <div 
            onClick={toggleModeratorView}
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${
              isModeratorView ? 'bg-[#5170ff] text-white shadow-[0_0_12px_rgba(81,112,255,0.8)]' : 'bg-white/10 text-white/70'
            }`}
            title={isModeratorView ? 'Moderator View is actief' : 'Moderator View inschakelen'}
          >
            {isModeratorView ? <Edit3 size={14} /> : <ShieldCheck size={15} />}
          </div>

          {/* Label & Toggle Button */}
          <button
            type="button"
            onClick={toggleModeratorView}
            className="flex items-center gap-2 text-left cursor-pointer group pr-1 focus:outline-none"
            aria-label="Toggle Moderator View"
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-white/90 tracking-wide uppercase group-hover:text-white transition-colors">
                Moderator View
              </span>
              <span className="text-[10px] text-white/50 -mt-0.5">
                {isModeratorView ? 'Klik op teksten om te bewerken' : 'Klik om in te schakelen'}
              </span>
            </div>

            {/* Switch Pill */}
            <div
              className={`ml-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 ${
                isModeratorView
                  ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-white/15 text-white/60 group-hover:bg-white/25'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isModeratorView ? 'bg-white animate-pulse' : 'bg-white/40'
                }`}
              />
              {isModeratorView ? 'Aan' : 'Uit'}
            </div>
          </button>

          {/* Quick link naar het centrale Dashboard */}
          <div className="h-4 w-[1px] bg-white/15 mx-0.5" />
          <button
            type="button"
            onClick={openCentralDashboard}
            className="p-1.5 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Naar Centraal Dashboard"
            aria-label="Naar Centraal Dashboard"
          >
            <Settings size={14} />
          </button>

          {/* Uitloggen */}
          <button
            type="button"
            onClick={logoutModerator}
            className="p-1.5 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-300 transition-colors cursor-pointer"
            title="Uitloggen als moderator"
            aria-label="Uitloggen als moderator"
          >
            <LogOut size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
