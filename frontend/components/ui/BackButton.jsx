import { useRouter } from "next/navigation";
import React from "react";

const BackButton = ({ title = "Back", children }) => {
  const router = useRouter();
  return (
    <button type="button" className="btn btn-primary py-1.5" onClick={() => router.back()}>
      {children || title}
    </button>
  );
};

export default BackButton;
