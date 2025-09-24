"use client";

import React from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Menu } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/store/auth";
import Image from "next/image";
import Profiles from "@/assets/img/profile.png";
import { signOut } from "next-auth/react";
const ProfileLabel = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <div className="flex items-center">
      <div className="flex-none text-slate-600 dark:text-white text-sm font-normal items-center lg:flex hidden overflow-hidden text-ellipsis whitespace-nowrap">
        <Image src={Profiles} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-[#D4AF37] mr-2" />
        <p className="text-white text-sm font-medium">{user?.email || ""}</p>
        <span className="text-base inline-block ltr:ml-[10px] rtl:mr-[10px]">
          <Icon icon="heroicons-outline:chevron-down"></Icon>
        </span>
      </div>
    </div>
  );
};

const Profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    const isConfirmed = confirm("Are you sure you want to log out!");
    if (!isConfirmed) return;

    await signOut({
      callbackUrl: "/dashboard/login", 
    });

    dispatch(clearAuth());
  };

  const ProfileMenu = [
    // {
    //   label: "Profile",
    //   icon: "heroicons-outline:user",

    //   action: () => {
    //     router.push("/profile");
    //   },
    // },
    {
      label: "Logout",
      icon: "heroicons-outline:login",
      action: () => {
        handleLogout();
      },
    },
  ];

  return (
    <Dropdown label={ProfileLabel()} classMenuItems="w-[180px] top-[58px]">
      {ProfileMenu.map((item, index) => (
        <Menu.Item key={index}>
          {({ active }) => (
            <div
              onClick={() => item.action()}
              className={`${
                active
                  ? "bg-slate-600 text-slate-300 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50"
                  : "text-slate-300 dark:text-slate-300"
              } block bg-slate-600     ${
                item.hasDivider ? "border-t border-slate-700 dark:border-slate-700" : ""
              }`}
            >
              <div className={`block cursor-pointer px-4 py-2`}>
                <div className="flex items-center">
                  <span className="block text-xl ltr:mr-3 rtl:ml-3">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="block text-sm">{item.label}</span>
                </div>
              </div>
            </div>
          )}
        </Menu.Item>
      ))}
    </Dropdown>
  );
};

export default Profile;
