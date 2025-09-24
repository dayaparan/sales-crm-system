"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import SubmitButton from "@/components/ui/SubmitButton";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";
import BackButton from "@/components/ui/BackButton";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, "Invalid email format"),
  phone: yup
    .string()
    .matches(/^[0-9]{10,15}$/, "Phone number must be between 10–15 digits")
    .required("Phone number is required"),
});

const UserForm = () => {
  const params = useParams();
  const userId = params?.id;
  const router = useRouter();

  const isEdit = Boolean(userId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    context: { isEdit },
    mode: "all",
  });

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get(`/user/${userId}`);
      const user = data.user;
      if (user) {
        setValue("name", user.name);
        setValue("email", user.email);
        setValue("phone", user.phone);
        // Do NOT set password
      }
    } catch (error) {
      handleError(error);
      router.push("/dashboard/user"); // Redirect back if error
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const { data: res } = await axiosInstance.put(`/user/${userId}`, data);
        toast.success(res.message);
      } else {
        const { data: res } = await axiosInstance.post("/user", data);
        toast.success(res.message);
        reset();
      }
      router.push("/dashboard/user");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Card title={isEdit ? "Edit User" : "Create User Account"} headerslot={<BackButton />}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textinput
          name={"name"}
          error={errors.name}
          label={"Name"}
          register={register}
          placeholder="Enter full name"
          type={"text"}
          isRequired
          msgTooltip
        />
        <Textinput
          name={"email"}
          error={errors.email}
          label={"Email"}
          register={register}
          placeholder="Enter email address"
          type={"email"}
          isRequired
          msgTooltip
        />
        <Textinput
          name={"phone"}
          error={errors.phone}
          label={"Phone"}
          register={register}
          placeholder="Enter phone number"
          type={"tel"}
          isRequired
          msgTooltip
        />
        <div className="col-span-2 text-end">
          <SubmitButton type="submit" isSubmitting={isSubmitting}>
            {isEdit ? "Update" : "Create"}
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;
