"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      const role = session?.user?.role;

      if (role === "admin") {
        router.replace("/admin");
      } else if (role === "user") {
        router.replace("/");
      } else {
        console.warn("Authenticated user but role is missing or invalid:", role);
        router.replace("/login");        
      }
    }
  
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid username or password");
    }


    setLoading(false);
  };

 
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side */}
      <div className="hidden md:flex w-[45%] bg-gradient-to-br from-blue-950 via-slate-900 to-teal-800 text-white items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px] opacity-30" />

        <div className="absolute top-8 left-8">
          <span className="text-2xl font-medium tracking-wide">
            Task<span className="text-teal-400">Forge</span>
          </span>
        </div>

        <div className="pl-16 pr-6 max-w-md">
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            Forge your <br />
            <span className="text-teal-400">workflow.</span>
          </h1>
          <p className="text-white/70 mt-5 text-lg">
            Built for focus, growth, and consistency.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-400/30 p-10 border border-slate-100">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
                Welcome back
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide">
                  USERNAME
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 border border-red-100 rounded-xl py-2 px-4">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}