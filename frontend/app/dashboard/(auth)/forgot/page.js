"use client";
import React from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Textinput from "@/components/ui/Textinput";
import handleError from "@/lib/handleError";
import SubmitButton from "@/components/ui/SubmitButton";
import axiosInstance from "@/lib/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
  })
  .required();
const Login = () => {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.post("/user/auth/forgot-password", data);
      if (!res.error) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <div className="min-h-[100vh] flex justify-center items-center p-4 bg-purple-500">
        <div className="bg-white min-w-full md:min-w-[500px] px-6 py-8 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            Forgot Password
          </h2>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Enter the details below to find your Account
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
            <Textinput
              name="email"
              placeholder="Enter Your Email..."
              label="email"
              type="email"
              register={register}
              error={errors.email}
              className="h-[48px]"
              onChange={(e) => setValue("email", e.target.value)}
            />

            <div className="flex justify-between">
              <Link
                href="/dashboard/login"
                className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
              >
                Back To Login?{" "}
              </Link>
            </div>

            <div className="flex flex-col">
              <SubmitButton isSubmitting={isSubmitting}>Recover</SubmitButton>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Login;
