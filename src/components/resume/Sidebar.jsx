import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({
  isOpen,
  onToggle,
  history,
  onHistoryClick,
  onNewAnalysis,
}) {
  return (
    <>
      
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={onToggle}
          onTouchEnd={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          bg-zinc-950 text-white
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"}
          flex flex-col border-r border-white/5
        `}
      >
        
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">ResumeAI</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
              }}
              className="p-3 -mr-2 bg-transparent hover:bg-white/10 active:bg-white/20 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation z-[99] relative"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 text-zinc-400 hover:text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        
        <div className="px-4 pb-2">
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 text-sm font-semibold text-zinc-300 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Elevate Home
          </Link>
        </div>

        
        <div className="px-4 pb-4">
          <button
            onClick={onNewAnalysis}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 rounded-xl transition-all duration-200 text-sm text-white font-semibold shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Analysis
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4" />

        
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
          <p className="text-[11px] text-zinc-600 uppercase tracking-[0.15em] font-bold mb-3 px-2">
            Recent
          </p>
          {history.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm text-zinc-500 font-medium">No analyses yet</p>
              <p className="text-xs text-zinc-600 mt-1">Upload a resume to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onHistoryClick(item)}
                  className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-zinc-700 transition-colors">
                      <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-300 truncate font-medium group-hover:text-white transition-colors">
                        {item.fileName}
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
