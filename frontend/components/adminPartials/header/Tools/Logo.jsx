"use client";

import React, { Fragment } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import Link from "next/link";
import useWidth from "@/hooks/useWidth";
import Image from "next/image";
import Logohead from "@/assets/img/logo.png";

const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link href="/dashboard">
        <React.Fragment>
          {width >= breakpoints.xl ? (
            <Image src={Logohead} alt="Logohead" className="w-18"
            />
          ) : (
            <Image src={Logohead} alt="Logohead" className="w-18"
            />
          )}
        </React.Fragment>
      </Link>
    </div>
  );
};

export default Logo;
