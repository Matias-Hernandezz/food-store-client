import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "",
    celular: "", password: "", confirmar: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.register({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        celular: form.celular || undefined,
        password: form.password,
      });
      await login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError((err as Error).message ?? "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "nombre", label: "Nombre", type: "text", placeholder: "Juan", required: true },
    { name: "apellido", label: "Apellido", type: "text", placeholder: "Pérez", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "tu@email.com", required: true },
    { name: "celular", label: "Celular (opc.)", type: "tel", placeholder: "+54 9 11...", required: false },
    { name: "password", label: "Contraseña", type: "password", placeholder: "Mínimo 8 caracteres", required: true },
    { name: "confirmar", label: "Confirmar", type: "password", placeholder: "Repetí la contraseña", required: true },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ backgroundColor: "#f5ede6" }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#2d1e0f]" style={{ fontFamily: "Georgia, serif" }}>
            Sahara
          </h1>
          <p className="text-sm text-[#9a8070] mt-1">Creá tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-bold text-[#5a4a3a] uppercase tracking-wider mb-2">
                {f.label}
              </label>
              <input
                name={f.name} type={f.type}
                value={form[f.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={f.placeholder}
                required={f.required}
                className="w-full px-4 py-3 rounded-xl border border-[#e8ddd5] text-sm focus:outline-none focus:border-[#c8722a] focus:ring-2 focus:ring-[#c8722a]/20"
              />
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#c8722a] hover:bg-[#a85e1f] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors">
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-[#c8722a] font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}