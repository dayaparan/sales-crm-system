"use client";

import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "@/assets/img/logo.png";

export default function NotFoundPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div
        className={`max-w-2xl mx-auto text-center transform ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        } transition-all duration-500`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8 cursor-pointer" onClick={() => router.push("/")} >
          <Image src={Logo} alt="Logo" width={240} height={240} className="" />
        </div>

        {/* 404 Text */}
        <h1 className="text-9xl font-bold text-gray-100 animate-pulse">
          4<span className="text-purple-500">0</span>4
        </h1>

        {/* Decorative Elements */}
        <div className="relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 space-y-6">
          <h2 className="text-3xl font-bold text-gray-100">Page Not Found</h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Oops! It seems like you've ventured into uncharted territory. The page you're looking for
            might have moved or doesn't exist.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 group"
              onClick={() => router.replace("/")}
            >
              <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Back to Home
            </button>
            <button
              className="flex items-center px-6 py-3 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200 group"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Previous Page
            </button>
          </div>

          {/* Help Links */}
          {/* <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              You might find these helpful:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                { title: "Help Center", desc: "Find answers to common questions" },
                { title: "Contact Support", desc: "Get help from our team" },
                { title: "Site Map", desc: "Browse all pages" },
                { title: "Latest Articles", desc: "Read our newest content" },
              ].map((item, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-4 bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <h4 className="font-semibold text-lg text-gray-100">{item.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                </a>
              ))}
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="mt-16 text-sm text-gray-400">
          <p>
            If you believe this is a mistake, please{" "}
            <a href="#" className="text-purple-500 hover:underline">
              report this issue
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
