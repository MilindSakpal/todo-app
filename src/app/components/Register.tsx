import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (
      !full_name ||
      !email ||
      !department ||
      !password ||
      !confirmPassword
    ) {
      return setError("Please fill all fields");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      await register({
        full_name,
        email,
        password,
        department,
      });

      alert("Registration Successful");

      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Registration Failed"
      );
    }

    setLoading(false);
  };
    return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center text-slate-800">
          Create Account
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-6">
          Register to access your Timesheet Dashboard
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 border border-red-300 text-red-600 p-3 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Full Name"
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Select Department
            </option>

            <option value="Development">
              Development
            </option>

            <option value="Design">
              Design
            </option>

            <option value="QA">
              QA
            </option>

            <option value="HR">
              HR
            </option>

            <option value="Management">
              Management
            </option>
          </select>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}