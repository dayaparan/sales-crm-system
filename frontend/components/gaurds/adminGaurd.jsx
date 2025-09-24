"use client"; // if using app directory

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AdminGuard = ({ children }) => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/dashboard/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return children;
};

export default AdminGuard;
