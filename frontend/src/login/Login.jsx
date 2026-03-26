import api from "../lib/api";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const [userInput, setUserInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handelInput = (e) => {
    setUserInput({
      ...userInput,
      [e.target.id]: e.target.value,
    });
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const login = await api.post(`/api/auth/login`, userInput);
      const data = login.data?.user;
      if (data.success === false) {
        setLoading(false);
        return toast.error(data.message);
      }

      toast.success(login.data?.message || "Logged in successfully");
      setAuthUser(data);
      navigate("/");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;
      const status = error?.response?.status;
      toast.error(
        error?.userMessage ||
          (status ? `Login failed (${status}): ${backendMessage || "Unknown error"}` : null) ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fade-up w-full max-w-md rounded-3xl p-6 md:p-8 glass-card">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">Welcome Back</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Sign in to Chatters</h1>
        <p className="mt-2 text-sm text-slate-600">Continue your conversations in one place.</p>
      </div>

      <form onSubmit={handelSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
          <input
            id="email"
            type="email"
            onChange={handelInput}
            value={userInput.email}
            placeholder="you@example.com"
            required
            className="h-11 w-full rounded-xl border border-slate-300 bg-white/90 px-4 text-slate-900 outline-none transition focus:border-cyan-700"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
          <input
            id="password"
            type="password"
            onChange={handelInput}
            value={userInput.password}
            placeholder="Enter your password"
            required
            className="h-11 w-full rounded-xl border border-slate-300 bg-white/90 px-4 text-slate-900 outline-none transition focus:border-cyan-700"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-cyan-700 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-700">
        New here?{" "}
        <Link to="/register" className="font-semibold text-cyan-800 underline decoration-2 underline-offset-4">
          Create an account
        </Link>
      </p>
    </section>
  );
};

export default Login;
