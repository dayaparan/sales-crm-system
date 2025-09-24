"use client";
import { useRouter } from "next/navigation";
import React from "react";

const AddButton = ({ title = "Add", children, route }) => {
  const router = useRouter();

  return (
    <button type="button" className="btn btn-primary py-1.5" onClick={() => router.push(route)}>
      {children || title}
    </button>
  );
};

export default AddButton;
