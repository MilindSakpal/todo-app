import { useState } from "react";
import { Eye, EyeOff, Clock } from "lucide-react";
import { login } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/1.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      console.log("Login Response:", data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("employee", JSON.stringify(data.employee));

      alert("Login Successful!");

      window.location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="Intellysis Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-center">Intellysis</h1>

        <p className="text-center text-slate-500 mt-2">
          Employee Time Sheet Login
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium">Office Email</label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="employee@intellysis.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 pr-12 outline-none focus:border-blue-500"
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
          <p className="text-center mt-4 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
