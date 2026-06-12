import React, { useState } from 'react';

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', role: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordRules = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'Uppercase and lowercase letters', ok: /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) },
    { label: 'Include a number', ok: /\d/.test(form.password) },
  ];

  const features = [
    {
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#60a5fa' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Real-time Alerts',
      desc: 'Get instant SOS alerts and situation updates.'
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#60a5fa' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Smart Coordination',
      desc: 'Connect citizens, rescue teams and control rooms.'
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#60a5fa' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered Insights',
      desc: 'AI predicts risks and helps in better decision making.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff' }}>

      {/* ── LEFT PANEL ── */}
      <div className="auth-left-panel" style={{
        width: '48%', position: 'relative', overflow: 'hidden', flexDirection: 'column', display: 'none'
      }}>
        {/* Splash background */}
         <img
  src="/splash.png"
  alt="SAJAG AI"
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    backgroundColor: '#0a1f4e' // fills empty space nicely
  }}
/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,28,70,0.7) 0%, rgba(10,28,70,0.5) 40%, rgba(10,28,70,0.8) 100%)'
        }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', padding: '32px' }}>
          {/* Logo + branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Logo"
              style={{ width: '52px', height: '52px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
              onError={e => e.target.style.display = 'none'}
            />
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.3px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>SAJAG AI</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>Smart Disaster Response &</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>Rescue Coordination Platform</div>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px',
              color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 500, padding: '4px 12px'
            }}>
              Powered by Nepal Police
            </span>
          </div>

          {/* Feature cards in the middle */}
          <div style={{ marginTop: 'auto', marginBottom: 'auto', paddingTop: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  background: 'rgba(10,28,70,0.5)', 
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 14px'
                }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                    background: 'rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{f.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11.5px', lineHeight: 1.4 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>© 2025 Nepal Police. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflowY: 'auto' }}>

        {/* Language bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '14px 32px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <span style={{ fontSize: '16px' }}>🇳🇵</span>
            <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>नेपाली</button>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>English</button>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 32px' }}>
          <div style={{ width: '100%', maxWidth: '460px' }}>

            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Create Your Account</h1>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '24px' }}>Join SAJAG AI and be a part of a safer Nepal</p>

            {/* Grid fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <svg style={iconStyle} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name" className="auth-input" style={inputStyle(true)} />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label style={labelStyle}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <svg style={iconStyle} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })}
                    placeholder="Enter mobile number" className="auth-input" style={inputStyle(true)} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <svg style={iconStyle} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email" className="auth-input" style={inputStyle(true)} />
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={labelStyle}>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="auth-input"
                  style={{
                    ...inputStyle(false),
                    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2394a3b8' viewBox='0 0 24 24'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                    paddingRight: '36px', paddingLeft: '14px'
                  }}>
                  <option value="">Select your role</option>
                  <option>Administrator</option>
                  <option>Rescue Team</option>
                  <option>Citizen</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <svg style={iconStyle} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a password" className="auth-input"
                    style={{ ...inputStyle(true), paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {showPw
                      ? <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <svg style={iconStyle} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showConfirm ? 'text' : 'password'} value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Confirm your password" className="auth-input"
                    style={{ ...inputStyle(true), paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {showConfirm
                      ? <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Password rules */}
            <div style={{
              marginTop: '14px', padding: '12px 14px', background: '#f0f7ff',
              border: '1.5px solid #dbeafe', borderRadius: '10px'
            }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Password must contain:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {passwordRules.map(r => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                      background: r.ok ? '#22c55e' : '#e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}>
                      {r.ok && <svg width="9" height="9" fill="#fff" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                    <span style={{ fontSize: '12px', color: r.ok ? '#15803d' : '#64748b', transition: 'color 0.2s' }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next button */}
            <button
              style={{
                width: '100%', marginTop: '16px', padding: '13px 0',
                background: 'linear-gradient(135deg, #1a3a6b 0%, #2563eb 100%)',
                color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
              }}>
              <span>Next</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b', marginTop: '16px' }}>
              Already have an account?{' '}
              <button onClick={onLogin} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '13.5px' }}>
                Login
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 32px 18px', fontSize: '12px', color: '#94a3b8' }}>
          <span>© 2025 Nepal Police. All rights reserved.</span>
          <span style={{ color: '#e2e8f0' }}>·</span>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>Privacy Policy</button>
          <span style={{ color: '#e2e8f0' }}>·</span>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>Terms of Use</button>
          <span style={{ color: '#e2e8f0' }}>·</span>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>Help</button>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .auth-left-panel { display: flex !important; } }
        .auth-input:focus { border-color: #3b82f6 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontWeight: 600, fontSize: '13px', color: '#334155', marginBottom: '6px'
};

const iconStyle = {
  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
  color: '#94a3b8', pointerEvents: 'none'
};

const inputStyle = (hasIcon) => ({
  width: '100%',
  paddingLeft: hasIcon ? '36px' : '14px',
  paddingRight: '14px',
  paddingTop: '10px',
  paddingBottom: '10px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '9px',
  fontSize: '13px',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#0f172a',
  transition: 'border-color 0.15s, box-shadow 0.15s'
});
