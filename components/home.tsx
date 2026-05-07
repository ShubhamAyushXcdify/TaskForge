"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-100 via-white to-white relative overflow-hidden">

     
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-20"></div>

      {/* MAIN */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-16 pb-12">

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div className="text-center md:text-left">
            <p className="text-sm text-teal-600 font-medium mb-3">
              Productivity • Learning • Growth
            </p>

            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Welcome to{" "}
              <span className="text-teal-600">TaskForge</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              A complete learning experience designed to help you grow,
              stay organized, and achieve more.
            </p>

            {/* BUTTONS */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/course">
                <button className="px-6 py-3 rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-md">
                  Explore Courses
                </button>
              </Link>

              <Link href="/dashboard">
                <button className="px-6 py-3 rounded-xl bg-gray-600 text-white hover:bg-gray-700">
                  Go to Dashboard
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT VIDEO */}
          <div className="hidden md:block">
            <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-4">
              
              <div className="relative">
                <video
                  className="rounded-xl w-full h-64 object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="public/demo.mp4" type="video/mp4" />
                </video>

                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}