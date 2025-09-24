"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useDarkMode from "@/hooks/useDarkMode";
import React, { Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/auth";
import { toast, ToastContainer } from "react-toastify";
import { Icon } from "@iconify/react";
import { signIn, useSession } from "next-auth/react";
import Background from "@/assets/img/background.jpg";
import Logo from "@/assets/img/logo.png";
import Image from "next/image";

const Login2 = () => {
  const dispatch = useDispatch();
  const [isDark] = useDarkMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.warn(error);
    }

    if (status === "authenticated" && !!session?.user) {
      console.log(session.user);

      if (session.user ) {
        dispatch(
          setAuth({
            user: session.user,
            token: session.user.email,
          })
        );
        router.replace("/dashboard");
      }
    }
  }, [status, session, dispatch, router, searchParams]);

  return (
    <>
      <div className="loginwrapper">
        <div className="lg-inner-column">
          <div className="right-column relative">
            <div className="inner-content flex justify-center items-center">
              <Image src={Background} alt="back" className="w-full h-full" priority/>
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/60 p-4">
                <div className="w-full max-w-lg flex flex-col items-center text-center my-6 bg-gradient-to-b from-[#000000] to-black-900 p-8 rounded-lg shadow-lg">
                  <div className="w-full">
                    <div className="mb-6">
                      <Image src={Logo} alt="FineAcers Logo" className="w-40 mx-auto mb-6" />
                      <h1 className="text-3xl font-semibold text-[#D4AF37] mb-2">Welcome to FineAcers</h1>
                      <p className="text-gray-300 text-sm">Your Luxury Real Estate Hub</p>
                    </div>

                    <button
                      type="button"
                      className="w-full px-8 py-2 bg-white mb-3 text-black-500 shadow flex justify-center items-center gap-3 rounded-md text-center"
                      onClick={() => signIn("google")}
                    >
                      <Icon icon="devicon:google" width="32" height="32" />
                      Sign in with Google
                    </button>
                    <div className="text-gray-300 text-sm mb-4">--- SECURED LOGIN ---</div>
                    <div className="flex justify-center">
                      <ul className="text-gray-50 text-sm space-y-2 mb-6">
                        <li className="flex items-center">
                          <span className="mr-2 text-[#D4AF37]">
                            <Icon icon="tdesign:secured" />
                          </span>
                          Enterprise-grade security
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-[#D4AF37]">
                            <Icon icon="ion:key-outline" />
                          </span>
                          Single Sign-On via Google
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-[#D4AF37]">
                            <Icon icon="mdi:secure-outline" />
                          </span>
                          No passwords to remember
                        </li>
                      </ul>
                    </div>
                    <p className="text-gray-400 text-xs mb-4">
                      New to FineAcers? Contact your administrator.
                    </p>
                    <div className="flex justify-center space-x-6 text-gray-400 text-xs">
                      <Link href="/" className="hover:text-yellow-300">
                        Terms
                      </Link>
                      <Link href="/" className="hover:text-yellow-300">
                        Privacy
                      </Link>
                      <Link href="/" className="hover:text-yellow-300">
                        Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

const LoginWrapper = () => {
  return (
    <Suspense>
      <Login2 />
    </Suspense>
  );
};

export default LoginWrapper;
