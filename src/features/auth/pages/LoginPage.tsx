import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { HelpModal } from "../components/HelpModal";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError((err as Error).message ?? "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ backgroundColor: "#E8D5C0" }}>
      <div className="w-full max-w-sm bg-[#F2E8D5] rounded-3xl shadow-xl shadow-[#2d1e0f]/10 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#F2E8D5] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 2v7c0 1.1.9 2 2 2h.5V22h2V11H8c1.1 0 2-.9 2-2V2H8v5H6V2H4v5H3V2H3z" fill="#2d1e0f" />
              <path d="M15 2c-1.9 0-3.5 1.6-3.5 3.5v7c0 1.4.9 2.5 2 2.8V22h2V15.3c1.1-.3 2-1.4 2-2.8v-7C17.5 3.6 16.9 2 15 2z" fill="#2d1e0f" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-[#C87A2E] tracking-tight leading-none" style={{ fontFamily: "'Georgia', serif" }}>
            Food Store
          </h1>
          <p className="text-sm text-[#9a8070] mt-2 tracking-wide">Iniciá sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.15em] text-[#C87A2E] uppercase mb-2">Usuario</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8070]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-[#F2E8D5] text-[#2d1e0f] placeholder-[#9a8070] text-sm focus:outline-none focus:border-[#C87A2E] focus:ring-2 focus:ring-[#C87A2E]/20 transition-all" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold tracking-[0.15em] text-[#C87A2E] uppercase">Contraseña</label>
              <button type="button"
                className="text-xs text-[#C87A2E] hover:text-[#B06920] font-medium transition-colors"
                onClick={() => setHelpOpen(true)}>
                ¿Necesitás ayuda?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8070]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••" required
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-gray-200 bg-[#F2E8D5] text-[#2d1e0f] placeholder-[#9a8070] text-sm focus:outline-none focus:border-[#C87A2E] focus:ring-2 focus:ring-[#C87A2E]/20 transition-all" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a8070] hover:text-[#C87A2E] transition-colors">
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#e05a3a]/10 border border-[#e05a3a]/30 text-[#e05a3a] text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#C87A2E] hover:bg-[#B06920] active:bg-[#C87A2E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs tracking-[0.2em] uppercase py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-[#2d1e0f]/30">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Ingresando...
              </>
            ) : (
              <>
                Ingresar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divisor + Soporte */}
        <div className="border-t border-gray-200 my-6" />
        <button onClick={() => setHelpOpen(true)}
          className="w-full text-center space-y-3 cursor-pointer hover:opacity-80 transition-opacity">
          <p className="text-xs text-[#9a8070]">Soporte&nbsp;•&nbsp;<span className="font-semibold text-[#C87A2E]">Centro de Ayuda</span></p>
          <div className="flex justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F2E8D5] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a8070" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#F2E8D5] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a8070" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
          </div>
        </button>

        <p className="text-center text-sm text-[#9a8070] mt-5">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="text-[#C87A2E] font-semibold hover:underline">Registrate</Link>
        </p>
      </div>

      <p className="mt-8 text-sm text-[#b09080] text-center italic max-w-xs leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
        "Donde la tradición se encuentra con un simple click."
      </p>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
