import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onRegister }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ id: "", password: "", remember: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login({
        id: form.id || "USR-001",
        name: "Inspector Sharma",
        role: "Administrator",
        dept: "Butwal Police Office",
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* ── LEFT PANEL (splash image + branding) ── */}
      <div className="auth-left-panel w-[48%] relative overflow-hidden flex-col hidden">
        {/* Splash background image */}
        <img
          src="/splash.png"
          alt="SAJAG AI"
          className="absolute inset-0 w-full h-full object-contain object-center"
          style={{ backgroundColor: "#0a1f4e" }}
        />
        {/* Dark overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,28,70,0.55) 0%, rgba(10,28,70,0.35) 50%, rgba(10,28,70,0.75) 100%)",
          }}
        />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col h-full p-8">
          {/* Logo + name at top */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-[52px] h-[52px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              onError={(e) => (e.target.style.display = "none")}
            />
            <div>
              <div className="text-white font-extrabold text-xl tracking-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
                SAJAG AI
              </div>
              <div className="text-white/75 text-[11px] font-normal">
                Smart Disaster Response &
              </div>
              <div className="text-white/75 text-[11px]">
                Rescue Coordination Platform
              </div>
            </div>
          </div>

          {/* Powered by Nepal Police */}
          <div className="mt-4">
            <span className="inline-block bg-white/15 backdrop-blur-sm border border-white/25 rounded-full text-white/90 text-[11px] font-medium px-3 py-1">
              Powered by Nepal Police
            </span>
          </div>

          {/* Bottom branding text */}
          <div className="mt-auto">
            <div
              className="border border-white/15 rounded-2xl p-4 mb-5"
              style={{ background: "rgba(10,28,70,0.55)" }}
            >
              <div className="flex items-center px-2.5 py-2 rounded-xl gap-2 mb-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-white font-bold text-sm">
                  Together for a Safer Nepal
                </span>
              </div>
              <div className="text-white/65 text-xs leading-relaxed">
                Real-time coordination. Faster response.
                <br />
                Safer communities.
              </div>
            </div>
            <p className="text-white/40 text-[11px]">
              © 2025 Nepal Police. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top language switcher */}
        <div className="flex justify-end items-center px-8 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-base">🇳🇵</span>
            <button className="bg-transparent border-none text-slate-500 text-[13px] cursor-pointer">
              नेपाली
            </button>
            <span className="text-slate-300">|</span>
            <button className="bg-transparent border-none text-blue-600 text-[13px] font-semibold cursor-pointer">
              English
            </button>
          </div>
        </div>

        {/* Center: form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[360px]">
            <h1 className="text-[28px] font-bold text-slate-900 mb-1">
              Welcome Back!
            </h1>
            <p className="text-slate-400 text-sm mb-7">
              Login to your SAJAG AI account
            </p>

            <form onSubmit={handleLogin}>
              {/* User ID */}
              <div className="mb-4">
                <label className="block font-semibold text-[13.5px] text-slate-700 mb-[7px]">
                  User ID or Email
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-[13px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="Enter your user ID or email"
                    className="auth-input w-full pl-10 pr-3.5 py-[11px] border-[1.5px] border-slate-200 rounded-[10px] text-[13.5px] bg-slate-50 outline-none box-border text-slate-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3.5">
                <label className="block font-semibold text-[13.5px] text-slate-700 mb-[7px]">
                  Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-[13px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    className="auth-input w-full pl-10 pr-[42px] py-[11px] border-[1.5px] border-slate-200 rounded-[10px] text-[13.5px] bg-slate-50 outline-none box-border text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex items-center"
                  >
                    {showPw ? (
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between mb-[22px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() =>
                      setForm({ ...form, remember: !form.remember })
                    }
                    className={`w-4 h-4 rounded flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150 ${
                      form.remember
                        ? "bg-blue-600 border-2 border-blue-600"
                        : "bg-white border-2 border-gray-300"
                    }`}
                  >
                    {form.remember && (
                      <svg width="10" height="10" fill="#fff" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] text-gray-700 select-none">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="bg-transparent border-none text-blue-600 text-[13px] font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login btn */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-[13px] text-white border-none rounded-[10px] text-[14.5px] font-semibold flex items-center justify-center gap-2 tracking-[0.2px] transition-opacity duration-150 ${
                  loading ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                style={{
                  background: "linear-gradient(135deg, #1a3a6b 0%, #2563eb 100%)",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                }}
              >
                {loading ? (
                  <svg
                    className="animate-spin w-[18px] h-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                ) : (
                  <>
                    <span>Login</span>
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 whitespace-nowrap">
                or continue with
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Social buttons */}
            <div className="flex flex-col gap-2.5">
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  ),
                  label: "Continue with Google",
                },
                {
                  icon: (
                    <svg width="18" height="18" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                  label: "Continue with Facebook",
                },
              ].map((s, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-center gap-2.5 py-[11px] border-[1.5px] border-slate-200 rounded-[10px] bg-white text-[13.5px] text-gray-700 cursor-pointer font-medium transition-all duration-150 hover:bg-slate-50 hover:border-slate-300"
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            <p className="text-center text-[13.5px] text-slate-500 mt-[22px]">
              Don't have an account?{" "}
              <button
                onClick={onRegister}
                className="bg-transparent border-none text-blue-600 font-semibold cursor-pointer text-[13.5px]"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 px-8 pb-5 pt-3.5 text-xs text-slate-400">
          <span>© 2025 Nepal Police. All rights reserved.</span>
          <span className="text-slate-200">·</span>
          <button className="bg-transparent border-none text-slate-400 cursor-pointer text-xs">
            Privacy Policy
          </button>
          <span className="text-slate-200">·</span>
          <button className="bg-transparent border-none text-slate-400 cursor-pointer text-xs">
            Terms of Use
          </button>
          <span className="text-slate-200">·</span>
          <button className="bg-transparent border-none text-slate-400 cursor-pointer text-xs">
            Help
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .auth-left-panel { display: flex !important; } }
        .auth-input:focus { border-color: #3b82f6 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; }
      `}</style>
    </div>
  );
}
