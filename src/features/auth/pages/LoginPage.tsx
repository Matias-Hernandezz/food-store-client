import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ backgroundColor: "#f5ede6" }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#2d1e0f]" style={{ fontFamily: "Georgia, serif" }}>
            FoodStore
          </h1>
          <p className="text-sm text-[#9a8070] mt-1">Iniciá sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5a4a3a] uppercase tracking-wider mb-2">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com" required
              className="w-full px-4 py-3 rounded-xl border border-[#e8ddd5] text-sm focus:outline-none focus:border-[#c8722a] focus:ring-2 focus:ring-[#c8722a]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#5a4a3a] uppercase tracking-wider mb-2">Contraseña</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-4 py-3 rounded-xl border border-[#e8ddd5] text-sm focus:outline-none focus:border-[#c8722a] focus:ring-2 focus:ring-[#c8722a]/20"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#c8722a] hover:bg-[#a85e1f] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="text-[#c8722a] font-semibold hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}