"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Courses", path: "/course" },
  ];

  const [showLogout, setShowLogout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between">
      
      
      <Link href="/">
        <h1 className="text-2xl font-semibold tracking-wide text-slate-800">
          Task<span className="text-teal-500">Forge</span>
        </h1>
      </Link>

      
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
              pathname === item.path
                ? "bg-teal-50 text-teal-600 font-semibold"
                : "text-slate-600 hover:text-teal-600 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
            
            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push("/profile");
              }}
              className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3"
            >
              👤 View Profile
            </button>

            <button
              onClick={() => {
                setShowUserMenu(false);
                setShowLogout(true);
              }}
              className="w-full text-left px-5 py-3 text-sm font-medium text-red-600 hover:bg-slate-50 flex items-center gap-3"
            >
              ⏻ Logout
            </button>
          </div>
        )}
      </div>

      
      {showLogout && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[340px] animate-in fade-in zoom-in-95">
            
            <h2 className="text-lg font-semibold text-slate-900">
              Confirm Logout
            </h2>

            <p className="text-slate-500 mt-2 mb-6 text-sm">
              Are you sure you want to logout from your account?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}