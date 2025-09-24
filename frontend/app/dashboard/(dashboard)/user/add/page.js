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

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, "Invalid email format"),
  phone: yup
    .string()
    .matches(/^[0-9]{10,15}$/, "Phone number must be between 10-15 digits")
    .required("Phone number is required"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

const AddUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.post("/user", data);
      if (!res.error) {
        toast.success(res.message);
        reset();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Card title={"Create User Account"} headerslot={<BackButton />}>
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
          onChange={(e) => setValue("name", e.target.value)}
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
          onChange={(e) => setValue("email", e.target.value)}
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
          onChange={(e) => setValue("phone", e.target.value)}
        />
        <Textinput
          name={"password"}
          error={errors.password}
          label={"Password"}
          register={register}
          placeholder="Enter password"
          type={"password"}
          isRequired
          msgTooltip
          hasicon
          onChange={(e) => setValue("password", e.target.value)}
        />
        {/* Submit Button */}
        <div className="col-span-2 text-end">
          <SubmitButton type="submit" isSubmitting={isSubmitting}>
            Create
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
};

export default AddUser;
