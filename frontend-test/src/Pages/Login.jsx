import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onRegister }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ id: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login({ id: form.id || 'USR-001', name: 'Inspector Sharma', role: 'Administrator', dept: 'Butwal Police Office' });
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff' }}>

      {/* ── LEFT PANEL (splash image + branding) ── */}
      <div className="auth-left-panel" style={{
        width: '48%', position: 'relative', overflow: 'hidden', flexDirection: 'column',
        display: 'none'
      }}>
        {/* Splash background image */}
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
        {/* Dark overlay for readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,28,70,0.55) 0%, rgba(10,28,70,0.35) 50%, rgba(10,28,70,0.75) 100%)'
        }} />

        {/* Content over image */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', padding: '32px' }}>
          {/* Logo + name at top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Logo"
              style={{ width: '52px', height: '52px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
              onError={e => e.target.style.display = 'none'}
            />
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.3px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>SAJAG AI</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 400 }}>Smart Disaster Response &</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>Rescue Coordination Platform</div>
            </div>
          </div>

          {/* Powered by Nepal Police */}
          <div style={{ marginTop: '16px' }}>
            <span style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px',
              color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 500, padding: '4px 12px'
            }}>
              Powered by Nepal Police
            </span>
          </div>

          {/* Bottom branding text */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{
              background: 'rgba(10,28,70,0.55)', backdropFilter: 'no',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px',
              padding: '16px 20px', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center',padding: '8px 10px',
    borderRadius: '12px', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Together for a Safer Nepal</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', lineHeight: 1.5 }}>
                Real-time coordination. Faster response.<br />Safer communities.
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>© 2025 Nepal Police. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>

        {/* Top language switcher */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          padding: '14px 32px', borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <span style={{ fontSize: '16px' }}>🇳🇵</span>
            <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>नेपाली</button>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>English</button>
          </div>
        </div>

        {/* Center: form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>

            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Welcome Back!</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>Login to your SAJAG AI account</p>

            <form onSubmit={handleLogin}>
              {/* User ID */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13.5px', color: '#334155', marginBottom: '7px' }}>
                  User ID or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}
                    width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input type="text" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}
                    placeholder="Enter your user ID or email"
                    className="auth-input"
                    style={{
                      width: '100%', paddingLeft: '40px', paddingRight: '14px', paddingTop: '11px', paddingBottom: '11px',
                      border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px',
                      background: '#f8fafc', outline: 'none', boxSizing: 'border-box', color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13.5px', color: '#334155', marginBottom: '7px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}
                    width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="auth-input"
                    style={{
                      width: '100%', paddingLeft: '40px', paddingRight: '42px', paddingTop: '11px', paddingBottom: '11px',
                      border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px',
                      background: '#f8fafc', outline: 'none', boxSizing: 'border-box', color: '#0f172a'
                    }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    {showPw
                      ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div onClick={() => setForm({ ...form, remember: !form.remember })}
                    style={{
                      width: '16px', height: '16px', borderRadius: '4px',
                      border: `2px solid ${form.remember ? '#2563eb' : '#d1d5db'}`,
                      background: form.remember ? '#2563eb' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s'
                    }}>
                    {form.remember && <svg width="10" height="10" fill="#fff" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <span style={{ fontSize: '13px', color: '#374151', userSelect: 'none' }}>Remember me</span>
                </label>
                <button type="button" style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Forgot Password?
                </button>
              </div>

              {/* Login btn */}
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #1a3a6b 0%, #2563eb 100%)',
                  color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', letterSpacing: '0.2px',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)', transition: 'opacity 0.15s'
                }}>
                {loading
                  ? <svg style={{ animation: 'auth-spin 0.8s linear infinite', width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  : <><span>Login</span><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
            </div>

            {/* Social buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  icon: <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>,
                  label: 'Continue with Google'
                },
                {
                  icon: <svg width="18" height="18" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
                  label: 'Continue with Facebook'
                }
              ].map((s, i) => (
                <button key={i}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '11px 0', border: '1.5px solid #e2e8f0', borderRadius: '10px',
                    background: '#fff', fontSize: '13.5px', color: '#374151', cursor: 'pointer',
                    fontWeight: 500, transition: 'background 0.15s, border-color 0.15s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b', marginTop: '22px' }}>
              Don't have an account?{' '}
              <button onClick={onRegister}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '13.5px' }}>
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '14px 32px 20px', fontSize: '12px', color: '#94a3b8' }}>
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
        @keyframes auth-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
