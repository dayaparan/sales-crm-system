"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Textinput from "@/components/ui/Textinput";
import handleError from "@/lib/handleError";
import SubmitButton from "@/components/ui/SubmitButton";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { Suspense } from "react";

// Validation schema
const schema = yup.object({
  password: yup.string().required("New password is required"),
  cpassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match"),
});

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.post(
        "/user/auth/reset-password",
        { password: data.password },
        {
          headers: { Authorization: token },
        }
      );
      if (!res.error) {
        toast.success(res.message);
        router.push("/dashboard/login");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 bg-purple-500">
        <div className="bg-white min-w-full md:min-w-[500px] px-6 py-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Invalid Request</h2>
          <p className="text-gray-500 text-sm mb-6">
            No reset token provided. Please use the link from your email.
          </p>
          <Link href="/dashboard/login" className="text-sm text-purple-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-purple-500">
      <div className="bg-white min-w-full md:min-w-[500px] px-6 py-8 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
          Create Password
        </h2>
        <p className="text-gray-500 text-sm mb-6 text-center">Enter new password to access your account</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textinput
            placeholder="Enter Your Password"
            label="New Password"
            type="password"
            name="password"
            register={register}
            error={errors.password}
            hasicon
            isRequired
          />
          <Textinput
            placeholder="Confirm Your Password"
            label="Confirm Password"
            type="password"
            name="cpassword"
            register={register}
            error={errors.cpassword}
            hasicon
            isRequired
          />
          <div className="flex justify-between">
            <Link
              href="/dashboard/login"
              className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
            >
              Back to Login
            </Link>
          </div>
          <div className="flex flex-col">
            <SubmitButton isSubmitting={isSubmitting}>Update</SubmitButton>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center p-4 bg-purple-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
