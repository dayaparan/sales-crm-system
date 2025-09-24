import React from "react";
import Tooltip from "../ui/Tooltip";
import Icons from "../ui/Icon";

const ActionButton = ({ title = "Title", icon, onClick, theme = "default" }) => {
  return (
    <Tooltip content={title} placement="top" theme={theme}>
      <button className="action-btn" onClick={onClick}>
        <Icons icon={icon} />
      </button>
    </Tooltip>
  );
};

export default ActionButton;
