import api from "../lib/api";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState({
    name: "",
    email: "",
    password: "",
    confpassword: "",
  });

  const handelInput = (e) => {
    setInputData({
      ...inputData,
      [e.target.id]: e.target.value,
    });
  };

  const handelSubmit = async (e) => {
    e.preventDefault();

    if (inputData.password !== inputData.confpassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const payload = {
        name: inputData.name,
        email: inputData.email,
        password: inputData.password,
      };
      let register;
      try {
        register = await api.post(`/api/auth/signup`, payload);
      } catch (error) {
        if (error?.response?.status === 404) {
          register = await api.post(`/api/auth/register`, payload);
        } else {
          throw error;
        }
      }
      const data = register.data?.user;

      if (data.success === false) {
        return toast.error(data.message || "Registration failed");
      }

      toast.success(register.data?.message || "Registered successfully");
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
          (status ? `Registration failed (${status}): ${backendMessage || "Unknown error"}` : null) ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fade-up w-full max-w-xl rounded-3xl p-6 md:p-8 glass-card">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Get Started</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Create your Chatters account</h1>
      </div>

      <form onSubmit={handelSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Name</span>
          <input
            id="name"
            type="text"
            onChange={handelInput}
            value={inputData.name}
            placeholder="Enter your name"
            required
            className="h-11 w-full rounded-xl border border-slate-300 bg-white/90 px-4 outline-none transition focus:border-cyan-700"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
          <input
            id="email"
            type="email"
            onChange={handelInput}
            value={inputData.email}
            placeholder="you@example.com"
            required
            className="h-11 w-full rounded-xl border border-slate-300 bg-white/90 px-4 outline-none transition focus:border-cyan-700"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
          <input
            id="password"
            type="password"
            onChange={handelInput}
            value={inputData.password}
            placeholder="Create password"
            required
            className="h-11 w-full rounded-xl border border-slate-300 bg-white/90 px-4 outline-none transition focus:border-cyan-700"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Confirm password</span>
          <input
            id="confpassword"
            type="password"
            onChange={handelInput}
            value={inputData.confpassword}
            placeholder="Re-enter password"
            required
            className="h-11 w-full rounded-xl border border-slate-300 bg-white/90 px-4 outline-none transition focus:border-cyan-700"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 rounded-xl bg-orange-600 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-700">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-cyan-800 underline decoration-2 underline-offset-4">
          Login
        </Link>
      </p>
    </section>
  );
};

export default Register;
