"use client";
import React from "react";
import { useSelector } from "react-redux";
import SuperAdminAddForm from "../../components/SuperAdminEditForm";
import ManagerAddForm from "../../components/ManagerEditForm";

const page = () => {
  const { user } = useSelector((state) => state.auth);

  const formMap = {
    ADMIN: SuperAdminAddForm,
    MANAGER: ManagerAddForm,
  };


  const Component = formMap[user?.role] || (() => <div>Form not found</div>);

  return <Component />;
};

export default page;
