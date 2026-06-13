// import React from 'react';
// import { useAuth } from '../../context/AuthContext';

// const NAV_ITEMS = [
//   { id: 'dashboard',         label: 'Dashboard',               icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
//   { id: 'live-map',          label: 'Live Map',                icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
//   { id: 'incidents',         label: 'Incidents',               icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', badge: 12 },
//   { id: 'sos-alerts',        label: 'SOS Alerts',              icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: 18, badgeRed: true },
//   { id: 'rescue-teams',      label: 'Rescue Teams',            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
//   { id: 'operations',        label: 'Operations',              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
//   { id: 'ai-heatmaps',       label: 'AI Heatmaps',            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//   { id: 'crowd-analytics',   label: 'Crowd Analytics',        icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
//   { id: 'traffic-analytics', label: 'Traffic Analytics',      icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
//   { id: 'reports',           label: 'Reports',                icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
//   { id: 'users',             label: 'Users',                  icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
//   { id: 'communications',    label: 'Communications',         icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//   { id: 'profile',           label: 'My Profile',             icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
//   { id: 'settings',          label: 'Settings',               icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
// ];

// function NavIcon({ d }) {
//   return (
//     <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
//       <path strokeLinecap="round" strokeLinejoin="round" d={d} />
//     </svg>
//   );
// }

// export default function Sidebar({ activePage, onNavigate }) {
//   const { user, logout } = useAuth();

//   return (
//     <div className="w-[240px] min-h-screen sidebar-bg flex flex-col text-white flex-shrink-0 shadow-2xl">

//       {/* ── Logo ── */}
//       <div className="px-5 py-5 border-b border-white/10">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ring-2 ring-white/20">
//             <img src="/icon.svg" alt="Logo" className="w-12 h-12 object-contain"
//               onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span class="text-primary font-bold text-base">🛡️</span>'; }} />
//           </div>
//           <div className="min-w-0">
//             <p className="font-bold text-[14px] text-white tracking-wide">SAJAG AI</p>
//             <p className="text-white/45 text-[9px] leading-tight mt-0.5">Smart Disaster Response &<br/>Rescue Coordination</p>
//           </div>
//         </div>
//       </div>

//       {/* ── Nav items ── */}
//       <nav className="flex-1 py-3 px-2.5 overflow-y-auto space-y-0.5">
//         {NAV_ITEMS.map(item => {
//           const active = activePage === item.id;
//           return (
//             <button
//               key={item.id}
//               onClick={() => onNavigate(item.id)}
//               className={`sidebar-item group relative w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
//                 active
//                   ? 'sidebar-item-active text-white shadow-md'
//                   : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
//               }`}
//             >
//               {/* Active left accent bar */}
//               {active && (
//                 <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-blue-400 rounded-r-full shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
//               )}
//               <NavIcon d={item.icon} />
//               <span className="flex-1 text-[12px] font-medium">{item.label}</span>
//               {item.badge && (
//                 <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold transition-transform ${item.badgeRed ? 'bg-red-500 sos-badge' : 'bg-orange-500'} text-white group-hover:scale-110`}>
//                   {item.badge}
//                 </span>
//               )}
//             </button>
//           );
//         })}
//       </nav>

//       {/* ── User profile card ── */}
//       <div className="p-3 border-t border-white/10">
//         <div className="bg-white/8 backdrop-blur-sm rounded-xl p-3 border border-white/12 shadow-lg">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0 ring-2 ring-white/20">
//               {user?.name?.charAt(0) || 'I'}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-[11.5px] font-semibold text-white truncate">{user?.name || 'Inspector Sharma'}</p>
//               <p className="text-white/40 text-[9px] truncate">{user?.role || 'Administrator'}</p>
//             </div>
//             <button
//               onClick={logout}
//               title="Logout"
//               className="text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-all p-1.5 rounded-lg"
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ── Version label ── */}
//       <div className="px-5 py-2 text-center border-t border-white/5">
//         <p className="text-white/20 text-[9px] tracking-widest uppercase">SAJAG AI v1.0</p>
//       </div>
//     </div>
//   );
// }


import React from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { id: 'live-map', label: 'Live Map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
      { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ],
  },
  {
    title: 'Emergency Monitoring',
    items: [
      { id: 'incidents', label: 'Incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', badge: 12 },
      { id: 'sos-alerts', label: 'SOS Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: 18, badgeRed: true },
      { id: 'ai-heatmaps', label: 'AI Heatmaps', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { id: 'crowd-analytics', label: 'Crowd Analytics', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { id: 'traffic-analytics', label: 'Traffic Analytics', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
    ],
  },
  {
    title: 'Field Operations',
    items: [
      { id: 'rescue-teams', label: 'Rescue Teams', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { id: 'operations', label: 'Operations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      { id: 'communications', label: 'Communications', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
      { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'My Profile', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ],
  },
];

function NavIcon({ d }) {
  return (
    <svg
      className="w-[17px] h-[17px] flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.7}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-[276px] min-h-screen flex-shrink-0 flex flex-col border-r border-slate-200 bg-[#0f2238] text-slate-100 shadow-[8px_0_30px_rgba(15,23,42,0.08)]">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-white/15 bg-white text-[#0f2238] shadow-sm overflow-hidden">
            <img
              src="/icon.svg"
              alt="SAJAG AI logo"
              className="h-20 w-20 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="text-[15px] font-bold tracking-wide">SA</span>';
              }}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-[0.18em] text-white uppercase">
              SAJAG AI
            </p>
            <p className="mt-1 text-[11px] leading-4 text-slate-300">
              Disaster Response Platform
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-white/10">
        <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
            Control Status
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[12px] font-medium text-white">National Monitoring Active</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`group relative flex min-h-[44px] w-full items-center gap-3 rounded-md px-3 py-2.5 text-left ${
                        active
                          ? 'bg-white/[0.08] text-white ring-1 ring-white/10'
                          : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-r-full ${
                          active ? 'bg-[#c8a96b]' : 'bg-transparent'
                        }`}
                      />

                      <span className={`${active ? 'text-[#e7cf9a]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        <NavIcon d={item.icon} />
                      </span>

                      <span className="flex-1 text-[13px] font-medium tracking-[0.01em]">
                        {item.label}
                      </span>

                      {item.badge ? (
                        <span
                          className={`min-w-[24px] rounded-full px-2 py-0.5 text-center text-[10px] font-semibold ${
                            item.badgeRed
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#19314d] text-[13px] font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white">
                {user?.name || 'Inspector Sharma'}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {user?.role || 'Administrator'}
              </p>
            </div>

            <button
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="rounded-md p-2 text-slate-400 hover:bg-white/[0.05] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 px-5 py-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
          <span>SAJAG AI</span>
          <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
}