"use client";

import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useDispatch, useSelector } from "react-redux";
import useMobileMenu from "@/hooks/useMobileMenu";
import Submenu from "./Submenu";

const Navmenu = ({ menus }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const location = usePathname();
  const locationName = location.replace("/", "");

  const { user } = useSelector((state) => state.auth);
  const userType = user?.role;
  const currentUserPermissions = user?.role?.permission || [];

  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  // Handle submenu open on route change
  useEffect(() => {
    let submenuIndex = null;
    menus.forEach((item, i) => {
      if (!item.child) return;
      const found = item.child.some((ci) => ci.childlink === locationName);
      if (found) submenuIndex = i;
    });

    setActiveSubmenu(submenuIndex);
    if (mobileMenu) setMobileMenu(false);
  }, [router, location]);

  // Permission check
  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) => currentUserPermissions.includes(perm));
  };

  // Role check
  const hasRole = (requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userType);
  };

  // Final check
  const shouldRenderItem = (item) => {
    if (item.isHeadr) return true;


    const permissionOk = hasPermission(item.permission);
    const roleOk = hasRole(item.allowedRoles);

    if (item.permission && item.allowedRoles) return permissionOk && roleOk;
    if (item.permission) return permissionOk;
    if (item.allowedRoles) return roleOk;

    if (item.child) {
      return item.child.some((child) => shouldRenderItem(child));
    }

    return true;
  };

  // Toggle submenu
  const toggleSubmenu = (i) => {
    setActiveSubmenu((prev) => (prev === i ? null : i));
  };

  return (
    <ul>
      {menus.map((item, i) => {
        if (!shouldRenderItem(item)) return null;

        const isActive = location === item.link;

        return (
          <li
            key={i}
            className={`single-sidebar-menu my-1
              ${item.child ? "item-has-children" : ""}
              ${activeSubmenu === i ? "open" : ""}
              ${isActive ? "menu-item-active" : ""}`}
          >
            {/* Menu label */}
            {item.isHeadr && !item.child && <div className="menulabel">{item.title}</div>}

            {/* Simple link */}
            {!item.child && !item.isHeadr && (
              <Link className="menu-link" href={item.link}>
                <span className="menu-icon flex-grow-0">
                  <Icon icon={item.icon} />
                </span>
                <div className="text-box flex-grow">{item.title}</div>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </Link>
            )}

            {/* Parent with children */}
            {item.child && (
              <>
                <div
                  className={`menu-link ${activeSubmenu === i ? "parent_active not-collapsed" : "collapsed"}`}
                  onClick={() => toggleSubmenu(i)}
                >
                  <div className="flex-1 flex items-start">
                    <span className="menu-icon">
                      <Icon icon={item.icon} />
                    </span>
                    <div className="text-box">{item.title}</div>
                  </div>
                  <div className="flex-0">
                    <div
                      className={`menu-arrow transform transition-all duration-300 ${
                        activeSubmenu === i ? " rotate-90" : ""
                      }`}
                    >
                      <Icon icon="heroicons-outline:chevron-right" />
                    </div>
                  </div>
                </div>

                <Submenu
                  activeSubmenu={activeSubmenu}
                  item={{
                    ...item,
                    child: item.child.filter((ci) => shouldRenderItem(ci)),
                  }}
                  i={i}
                  locationName={locationName}
                />
              </>
            )}
          </li>
        );
      })}
      <li className="px-3 mt-4">
         <div className="bg-[#D4AF37] p-4 text-center rounded-lg">
          <div className="flex  justify-center ">
          <Icon icon="bi:whatsapp"  className="text-white text-6xl border-4 border-white rounded-full text-center "/></div>
          <h1 className="text-white text-xl">Whatsapp Contact</h1>
          
        </div>
      </li>
    </ul>
  );
};

export default Navmenu;
