import React from "react";
import Icon from "@/components/ui/Icon";
import SwitchDark from "./Tools/SwitchDark";
import HorizentalMenu from "./Tools/HorizentalMenu";
import useWidth from "@/hooks/useWidth";
import useSidebar from "@/hooks/useSidebar";
import useNavbarType from "@/hooks/useNavbarType";
import useMenulayout from "@/hooks/useMenulayout";
import useSkin from "@/hooks/useSkin";
import Logo from "./Tools/Logo";
import Profiles from "@/assets/img/profile.png";
import { useState } from "react";
import SearchModal from "./Tools/SearchModal";
import Profile from "./Tools/Profile";
import Notification from "./Tools/Notification";
import Message from "./Tools/Message";
import Language from "./Tools/Language";
import useRtl from "@/hooks/useRtl";
import useMobileMenu from "@/hooks/useMobileMenu";
import { ChevronDown, Search } from "lucide-react";
import Image from "next/image";

const Header = ({ className = "custom-class" }) => {
  const [collapsed, setMenuCollapsed] = useSidebar();
  const { width, breakpoints } = useWidth();
  const [navbarType] = useNavbarType();
  const navbarTypeClass = () => {
    switch (navbarType) {
      case "floating":
        return "floating  has-sticky-header";
      case "sticky":
        return "sticky top-0 z-[999]";
      case "static":
        return "static";
      case "hidden":
        return "hidden";
      default:
        return "sticky top-0";
    }
  };
  const [menuType] = useMenulayout();
  const [skin] = useSkin();
  const [isRtl] = useRtl();

  const [mobileMenu, setMobileMenu] = useMobileMenu();

  const handleOpenMobileMenu = () => {
    setMobileMenu(!mobileMenu);
  };

  const borderSwicthClass = () => {
    if (skin === "bordered" && navbarType !== "floating") {
      return "border-b border-slate-200 dark:border-slate-700";
    } else if (skin === "bordered" && navbarType === "floating") {
      return "border border-slate-200 dark:border-slate-700";
    } else {
      return "dark:border-b dark:border-slate-700 dark:border-opacity-60";
    }
  };
  const [branch, setBranch] = useState("Branch");
  const [project, setProject] = useState("Project");
  const [model, setModel] = useState("Model");
  return (
    <header className={className + " " + navbarTypeClass()}>
      <div
        className={` app-header md:px-6 px-[15px]  dark:bg-slate-800 shadow-base dark:shadow-base3 bg-[#0B1530]
        ${borderSwicthClass()}
             ${menuType === "horizontal" && width > breakpoints.xl ? "py-1" : "md:py-6 py-3"}
        `}
      >
        <div className="flex justify-between items-center h-full">
          {/* For Vertical  */}

          {menuType === "vertical" && (
            <div className="flex items-center md:space-x-4 space-x-2 rtl:space-x-reverse">
              {collapsed && width >= breakpoints.xl && (
                <button
                  className="text-xl text-slate-900 dark:text-white"
                  onClick={() => setMenuCollapsed(!collapsed)}
                >
                  {isRtl ? <Icon icon="akar-icons:arrow-left" /> : <Icon icon="akar-icons:arrow-right" />}
                </button>
              )}
              {width < breakpoints.xl && <Logo />}
              {/* open mobile menu handlaer*/}
              {width < breakpoints.xl && width >= breakpoints.md && (
                <div
                  className="cursor-pointer text-slate-900 dark:text-white text-2xl"
                  onClick={handleOpenMobileMenu}
                >
                  <Icon icon="heroicons-outline:menu-alt-3" />
                </div>
              )}
            </div>
          )}
          {/* For Horizontal  */}
          {menuType === "horizontal" && (
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Logo />
              {/* open mobile menu handlaer*/}
              {width <= breakpoints.xl && (
                <div
                  className="cursor-pointer text-slate-900 dark:text-white text-2xl"
                  onClick={handleOpenMobileMenu}
                >
                  <Icon icon="heroicons-outline:menu-alt-3" />
                </div>
              )}
            </div>
          )}
          {/*  Horizontal  Main Menu */}
          {menuType === "horizontal" && width >= breakpoints.xl ? <HorizentalMenu /> : null}
          {/* Nav Tools  */}
          <header className="w-full  px-6 py-3 flex items-center justify-between ">
            {/* Left Side */}
            <div className="lg:flex hidden items-center gap-4">
              {/* <h1 className="text-white text-2xl font-serif font-semibold">Dashboard</h1>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="bg-[#0c1221] text-white text-sm px-2 py-1.5 rounded-lg border border-gray-700 focus:outline-none"
              >
                <option>Branch</option>
                <option>Branch 1</option>
                <option>Branch 2</option>
              </select>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="bg-[#0c1221] text-white text-sm px-2 py-1.5 rounded-lg border border-gray-700 focus:outline-none"
              >
                <option>Project</option>
                <option>Project A</option>
                <option>Project B</option>
              </select>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-[#0c1221] text-white text-sm px-2 py-1.5 rounded-lg border border-gray-700 focus:outline-none"
              >
                <option>Model</option>
                <option>Model X</option>
                <option>Model Y</option>
              </select> */}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="lg:flex hidden items-center bg-[#0c1221] rounded-lg px-3 py-1.5 border border-gray-700">
                <Search size={16} className="text-gray-200" />
                <input
                  type="text"
                  placeholder="Search for anything"
                  className="bg-transparent outline-none text-sm text-white placeholder-gray-200 ml-2"
                />
              </div>

              <div className="lg:flex hidden items-center bg-[#0c1221] rounded-lg px-3 py-1.5 border border-gray-700">
                <Icon icon="mdi-light:bell" className="text-white font-bold text-lg" />
              </div>

              {/* Profile Info */}
              <Profile />
              {/* <div className="flex justify-end items-center gap-2">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">Khaluz Usman</p>
                  <p className="text-[#D4AF37] text-xs">Level 25 - Owner</p>
                </div>
                <Image
                  src={Profiles}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-[#D4AF37]"
                />
              </div> */}
            </div>
          </header>
          <div className="nav-tools flex items-center lg:space-x-6 space-x-3 rtl:space-x-reverse">
            {/* {width >= breakpoints.md && <Profile />} */}
            {width <= breakpoints.md && (
              <div
                className="cursor-pointer text-slate-100 dark:text-white text-2xl"
                onClick={handleOpenMobileMenu}
              >
                <Icon icon="heroicons-outline:menu-alt-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
