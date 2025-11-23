"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        {/* Hero Section */}
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          AI Game Platform
        </h1>
        <p className="text-2xl text-gray-600 mb-16">
          Create 3D games with natural language
        </p>

        {/* Main CTA */}
        <button
          onClick={() => router.push("/editor")}
          className="px-12 py-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold text-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transform mb-6"
        >
          Build Game!
        </button>

        {/* Sub CTA */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/runtime")}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-lg underline"
          >
            View Runtime Demo →
          </button>
        </div>
      </div>
    </div>
  );
}
