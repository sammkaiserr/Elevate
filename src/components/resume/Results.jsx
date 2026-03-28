import React from "react";

function SectionCard({
  icon,
  iconBg,
  iconColor,
  title,
  count,
  children,
  delay = "0s",
}) {
  return (
    <div
      className="glass-card p-6 animate-slide-up"
      style={{ animationDelay: delay, animationFillMode: "both" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
          {count !== undefined && (
            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
              {count}
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Results({ analysis }) {
  return (
    <div className="space-y-5">
      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
        <StatCard
          label="ATS Score"
          value={analysis.ats_score ? `${analysis.ats_score}/100` : "N/A"}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="brand"
        />
        <StatCard
          label="Tech Skills"
          value={String(analysis.technical_skills?.length || 0)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Languages"
          value={String(analysis.languages?.length || 0)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="emerald"
        />
        <StatCard
          label="Skill Gaps"
          value={String(analysis.missing_skills?.length || 0)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          color="rose"
        />
      </div>

      {/* Technical Skills */}
      {analysis.technical_skills?.length > 0 && (
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          title="Technical Skills"
          count={analysis.technical_skills.length}
          delay="0.05s"
        >
          <div className="flex flex-wrap gap-2">
            {analysis.technical_skills.map((skill, i) => (
              <span key={i} className="skill-tag">{skill}</span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Programming Languages */}
      {analysis.languages?.length > 0 && (
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          title="Programming Languages"
          count={analysis.languages.length}
          delay="0.1s"
        >
          <div className="flex flex-wrap gap-2">
            {analysis.languages.map((lang, i) => (
              <span key={i} className="skill-tag-green">{lang}</span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Frameworks */}
      {analysis.frameworks?.length > 0 && (
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          iconBg="bg-violet-50 dark:bg-violet-500/10"
          iconColor="text-violet-600 dark:text-violet-400"
          title="Frameworks & Libraries"
          count={analysis.frameworks.length}
          delay="0.15s"
        >
          <div className="flex flex-wrap gap-2">
            {analysis.frameworks.map((fw, i) => (
              <span key={i} className="skill-tag-purple">{fw}</span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Soft Skills */}
      {analysis.soft_skills?.length > 0 && (
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          iconBg="bg-orange-50 dark:bg-orange-500/10"
          iconColor="text-orange-600 dark:text-orange-400"
          title="Soft Skills"
          count={analysis.soft_skills.length}
          delay="0.2s"
        >
          <div className="flex flex-wrap gap-2">
            {analysis.soft_skills.map((skill, i) => (
              <span key={i} className="skill-tag-amber">{skill}</span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Detailed Feedback */}
      {analysis.feedback && (
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          title="Detailed Feedback"
          delay="0.25s"
        >
          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{analysis.feedback}</p>
          </div>
        </SectionCard>
      )}

      {/* Improvement Suggestions */}
      {analysis.suggestions?.length > 0 && (
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          iconBg="bg-brand-50 dark:bg-brand-500/10"
          iconColor="text-brand-600 dark:text-brand-400"
          title="Improvement Suggestions"
          delay="0.3s"
        >
          <ul className="space-y-3">
            {analysis.suggestions.map((suggestion, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Keywords to Add */}
      {analysis.better_keywords?.length > 0 && (
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>}
          iconBg="bg-violet-50 dark:bg-violet-500/10"
          iconColor="text-violet-600 dark:text-violet-400"
          title="Keywords to Add"
          delay="0.35s"
        >
          <div className="flex flex-wrap gap-2">
            {analysis.better_keywords.map((keyword, i) => (
              <span key={i} className="skill-tag-purple">{keyword}</span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Skill Gaps */}
      {analysis.missing_skills?.length > 0 && (
        <SectionCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
          iconBg="bg-rose-50 dark:bg-rose-500/10"
          iconColor="text-rose-500 dark:text-rose-400"
          title="Skills to Develop"
          count={analysis.missing_skills.length}
          delay="0.4s"
        >
          <p className="text-xs text-zinc-400 mb-3 font-medium">Consider learning these to boost your profile</p>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_skills.map((skill, i) => (
              <span key={i} className="skill-tag-red">{skill}</span>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    brand: { bg: "bg-brand-50 dark:bg-brand-500/10", text: "text-brand-600 dark:text-brand-400", border: "border-brand-100 dark:border-brand-500/20" },
    blue: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-100 dark:border-blue-500/20" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-500/20" },
    rose: { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-100 dark:border-rose-500/20" },
  };

  const c = colorMap[color] || colorMap.brand;

  return (
    <div className={`${c.bg} rounded-2xl p-4 border ${c.border} animate-scale-in`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={c.text}>{icon}</div>
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-extrabold ${c.text}`}>{value}</p>
    </div>
  );
}
