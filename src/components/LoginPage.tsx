import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { authenticate, CREDENTIALS } from '../lib/credentials';
import { Actor } from '../lib/types';

interface LoginPageProps {
  onSuccess: (actor: Actor) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const triggerError = (msg: string) => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    setErrorMsg(msg);
    errorTimerRef.current = setTimeout(() => {
      setErrorMsg(null);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      triggerError('FILL ALL FIELDS — Please enter both work email and password.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    // Brief delay for the editorial VERIFYING... state
    await new Promise((r) => setTimeout(r, 450));

    const match = authenticate(email, password);

    if (!match) {
      setIsVerifying(false);
      triggerError('INVALID CREDENTIALS — Check your email and password.');
      return;
    }

    const sessionActor: Actor = {
      apiKey: match.apiKey,
      role: match.role,
      actorId: match.actorId,
      name: match.name,
      title: match.title || `${match.role.toUpperCase()} User`,
      avatarInitials:
        match.avatarInitials ||
        match.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
      email: match.email,
    };

    try {
      localStorage.setItem('fin21_session', JSON.stringify(sessionActor));
    } catch (err) {
      console.error('Session persistence failed:', err);
    }

    setIsVerifying(false);
    onSuccess(sessionActor);
  };

  const handleSelectPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#EDE8DF] text-[#0F0F0F] flex flex-col lg:flex-row selection:bg-[#C8352B] selection:text-[#EDE8DF]">
      {/* LEFT COLUMN (60% width) */}
      <div className="w-full lg:w-[60%] flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Top Label */}
        <div>
          <span className="small-caps text-[11px] sm:text-[12px] tracking-[0.25em] text-[#8A8378] font-bold block">
            FIN21 · FORENSICS
          </span>
        </div>

        {/* Hero Display Typography */}
        <div className="my-10 lg:my-0 max-w-2xl">
          <h1 className="font-anton text-[72px] sm:text-[100px] lg:text-[120px] text-[#C8352B] tracking-[-0.02em] leading-[0.85] uppercase">
            SIGN IN.
          </h1>
          <h2 className="font-anton text-[40px] sm:text-[54px] lg:text-[64px] text-[#0F0F0F] tracking-[-0.02em] leading-[0.9] uppercase mt-2">
            TO YOUR WORKSPACE.
          </h2>
          <p className="font-sans text-[#8A8378] text-base sm:text-lg max-w-lg mt-6 leading-relaxed">
            Autonomous expense audit, live Nova policy enforcement, and Maker-Checker approval built for modern finance teams.
          </p>
        </div>

        {/* Footer info */}
        <div>
          <span className="small-caps text-[10px] sm:text-[11px] tracking-[0.25em] text-[#8A8378] font-medium block">
            AUTONOMOUS AUDIT ENGINE · V1.0.0
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN (40% width) */}
      <div className="w-full lg:w-[40%] bg-[#F5F1E8] border-t lg:border-t-0 lg:border-l border-[#0F0F0F] flex flex-col justify-center items-center p-6 sm:p-12 lg:p-14">
        <div className="w-full max-w-[420px]">
          {/* Label above form */}
          <div className="small-caps text-[11px] tracking-[0.25em] text-[#8A8378] font-bold mb-8">
            EMPLOYEE ACCESS
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1 — EMAIL */}
            <div>
              <label className="small-caps text-[11px] tracking-[0.25em] text-[#8A8378] block mb-1 font-bold">
                WORK EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ravi@tulasisupplies.example"
                disabled={isVerifying}
                className="w-full bg-transparent border-0 border-b border-[#0F0F0F] rounded-none px-0 py-2.5 text-[#0F0F0F] font-sans text-base placeholder:text-[#8A8378] focus:outline-none focus:border-[#C8352B] transition-colors"
                autoComplete="email"
              />
            </div>

            {/* Field 2 — PASSWORD */}
            <div>
              <label className="small-caps text-[11px] tracking-[0.25em] text-[#8A8378] block mb-1 font-bold">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isVerifying}
                  className="w-full bg-transparent border-0 border-b border-[#0F0F0F] rounded-none px-0 py-2.5 pr-10 text-[#0F0F0F] font-sans text-base placeholder:text-[#8A8378] focus:outline-none focus:border-[#C8352B] transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#8A8378] hover:text-[#0F0F0F] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[1.5]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[1.5]" />
                  )}
                </button>
              </div>
            </div>

            {/* Space 32px before button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full h-[56px] bg-[#C8352B] hover:bg-[#A8281F] text-[#EDE8DF] transition-colors flex items-center justify-center font-anton text-[18px] uppercase tracking-[0.2em] group disabled:opacity-80"
              >
                {isVerifying ? (
                  <span className="flex items-center space-x-1 tracking-[0.25em]">
                    <span>VERIFYING</span>
                    <span className="inline-flex">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                    </span>
                  </span>
                ) : (
                  <span>
                    SIGN IN{' '}
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 ml-1.5">
                      →
                    </span>
                  </span>
                )}
              </button>
            </div>

            {/* Error state (Space 16px below button) */}
            {errorMsg && (
              <div className="border border-[#C8352B] bg-[#C8352B]/5 p-3 flex items-center space-x-3 text-left">
                <AlertTriangle className="w-5 h-5 text-[#C8352B] stroke-[1.5] shrink-0" />
                <span className="small-caps text-[11px] text-[#0F0F0F] font-bold leading-tight">
                  {errorMsg}
                </span>
              </div>
            )}
          </form>

          {/* Space 24px and Divider line (1px ink) */}
          <div className="border-t border-[#0F0F0F] mt-8 mb-6" />

          {/* Below divider: DEMO CREDENTIALS */}
          <div>
            <div className="small-caps text-[11px] tracking-[0.25em] text-[#8A8378] font-bold mb-3">
              DEMO CREDENTIALS
            </div>

            <div className="space-y-1.5 font-mono text-[10px]">
              {CREDENTIALS.map((cred) => (
                <div
                  key={cred.email}
                  onClick={() => handleSelectPreset(cred.email, cred.password)}
                  className="p-2 border border-transparent hover:border-[#0F0F0F] hover:bg-[#EDE8DF] cursor-pointer transition-all flex items-center justify-between gap-2 group"
                  title="Click to auto-fill credentials"
                >
                  <div className="min-w-0 flex-1 truncate text-[#0F0F0F] font-bold group-hover:text-[#C8352B] transition-colors">
  <span>{cred.email}</span>
  <span className="mx-1">/</span>
  <span>{cred.password}</span>
</div>
                  <span className="small-caps text-[9px] text-[#8A8378] group-hover:text-[#0F0F0F] font-bold shrink-0">
                    → {cred.role.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};