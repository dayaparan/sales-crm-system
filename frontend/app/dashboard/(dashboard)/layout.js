"use client";

import { Suspense, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Header from "@/components/adminPartials/header";
import Sidebar from "@/components/adminPartials/sidebar";
import useWidth from "@/hooks/useWidth";
import useSidebar from "@/hooks/useSidebar";
import useContentWidth from "@/hooks/useContentWidth";
import useMenulayout from "@/hooks/useMenulayout";
import useMenuHidden from "@/hooks/useMenuHidden";
import MobileMenu from "@/components/adminPartials/sidebar/MobileMenu";
import useMobileMenu from "@/hooks/useMobileMenu";
import useRtl from "@/hooks/useRtl";
import useDarkMode from "@/hooks/useDarkMode";
import useSkin from "@/hooks/useSkin";
import Loading from "@/components/ui/Loading";
import useNavbarType from "@/hooks/useNavbarType";
import AdminGuard from "@/components/gaurds/adminGaurd";
import { useDispatch, useSelector } from "react-redux";
import handleError from "@/lib/handleError";
import axiosInstance from "@/lib/axiosInstance";
import { setBranches } from "@/store/branch";

export default function RootLayout({ children }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { width, breakpoints } = useWidth();
  const [collapsed] = useSidebar();
  const [isRtl] = useRtl();
  const [isDark] = useDarkMode();
  const [skin] = useSkin();
  const [navbarType] = useNavbarType();
  const router = useRouter();

  const location = usePathname();
  // header switch class
  const switchHeaderClass = () => {
    if (menuType === "horizontal" || menuHidden) {
      return "ltr:ml-0 rtl:mr-0";
    } else if (collapsed) {
      return "ltr:ml-[72px] rtl:mr-[72px]";
    } else {
      return "ltr:ml-[248px] rtl:mr-[248px]";
    }
  };

  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const getData = async () => {
      try {
        const { data } = await axiosInstance.get("/common", { params: { branch: true } });
        if (data.success) {
          dispatch(setBranches(data?.data?.branch));
        }
      } catch (error) {
        handleError(error);
      }
    };
    getData();
  }, [user]);

  // content width
  const [contentWidth] = useContentWidth();
  const [menuType] = useMenulayout();
  const [menuHidden] = useMenuHidden();
  // mobile menu
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  return (
    <>
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`app-warp    ${isDark ? "dark" : "light"} ${skin === "bordered" ? "skin--bordered" : "skin--default"}
      ${navbarType === "floating" ? "has-floating" : ""}
      `}
      >
        <ToastContainer />
        <Header className={width > breakpoints.xl ? switchHeaderClass() : ""} />
        {menuType === "vertical" && width > breakpoints.xl && !menuHidden && <Sidebar />}
        <MobileMenu
          className={`${
            width < breakpoints.xl && mobileMenu
              ? "left-0 visible opacity-100  z-[9999]"
              : "left-[-300px] invisible opacity-0  z-[-999] "
          }`}
        />
        {/* mobile menu overlay*/}
        {width < breakpoints.xl && mobileMenu && (
          <div
            className="overlay bg-slate-900/50 backdrop-filter backdrop-blur-sm opacity-100 fixed inset-0 z-[999]"
            onClick={() => setMobileMenu(false)}
          ></div>
        )}
        <div className={`content-wrapper transition-all duration-150 ${width > 1280 ? switchHeaderClass() : ""}`}>
          {/* md:min-h-screen will h-full*/}
          <div className="page-content   page-min-height  ">
            <div className={contentWidth === "boxed" ? "container mx-auto" : "container-fluid"}>
              <div>
                <Suspense fallback={<Loading />}>{children}</Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
