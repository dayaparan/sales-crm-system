"use client";

import { Home, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "@/assets/img/logo.png";

export default function UnauthorizedPage() {
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
        <div
          className="flex justify-center mb-8 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image src={Logo} alt="Logo" width={200} height={200} />
        </div>

        {/* 403 Text */}
        <h1 className="text-9xl font-bold text-gray-100 animate-pulse">
          4<span className="text-red-500">0</span>3
        </h1>

        {/* Decorative line */}
        <div className="relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 space-y-6">
          <h2 className="text-3xl font-bold text-gray-100">
            Unauthorized Access
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Sorry, you don’t have permission to view this page.  
            Please contact your administrator if you believe this is an error.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 group"
              onClick={() => router.replace("/")}
            >
              <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Back to Home
            </button>
            <button
              className="flex items-center px-6 py-3 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200 group"
              onClick={() => router.replace("/dashboard/login")}
            >
              <LogOut className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Login Again
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-sm text-gray-400">
          <p>
            If you believe this is a mistake, please{" "}
            <a href="#" className="text-red-500 hover:underline">
              report this issue
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
