import React from "react";

const Loading = ({ loading = true, children, className = "h-[50vh]" }) => {
  if (!loading) {
    return children;
  }

  return (
    <div className={`${className} flex justify-center items-center`}>
      <span className="loader"></span>
    </div>
  );
};

export default Loading;
