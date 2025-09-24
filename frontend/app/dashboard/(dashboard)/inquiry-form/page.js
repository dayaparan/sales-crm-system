"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import SubmitButton from "@/components/ui/SubmitButton";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";

const inquiryTypes = [
  { value: "INVESTOR", label: "Investor" },
  { value: "CLIENT", label: "Client" },
  { value: "USER", label: "User" },
];

const validationSchema = yup.object().shape({
  name: yup.string().required("Full Name / Company is required"),
  email: yup
    .string()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, "Invalid email format"),
  type: yup
    .string()
    .required("Inquiry Type is required")
    .oneOf(["INVESTOR", "CLIENT", "USER"], "Invalid inquiry type"),
  budget: yup.string().required("Budget / Investment is required"),
  details: yup.string().nullable(),
});

const InquiryForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  const onSubmit = async (formData) => {
    try {
      const { data } = await axiosInstance.post("/user/lead/inquiry", formData);
      if (data.success) {
        toast.success(data.message);
        reset();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Card title={"New Project / Investor Inquiry"}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Textinput
          name="name"
          label="Full Name / Company"
          placeholder="e.g. Jane Doe"
          register={register}
          error={errors.name}
          isRequired
          msgTooltip
          onChange={(e) => setValue("name", e.target.value)}
        />

        <Textinput
          name="email"
          label="Contact Email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
          type="email"
          isRequired
          msgTooltip
          onChange={(e) => setValue("email", e.target.value)}
        />

        <Select
          name="type"
          label="Inquiry Type"
          options={inquiryTypes}
          register={register}
          error={errors.type}
          isRequired
          msgTooltip
          onChange={(e) => setValue("type", e.target.value)}
        />

        <Textinput
          name="budget"
          label="Estimated Budget / Investment ($)"
          placeholder="e.g. 500,000"
          register={register}
          error={errors.budget}
          isRequired
          msgTooltip
          onChange={(e) => setValue("budget", e.target.value)}
        />

        <div className="flex flex-col md:col-span-2">
          <label className="text-sm mb-1">Additional Comments</label>
          <textarea
            {...register("details")}
            rows={6}
            placeholder="Briefly describe your project"
            className="bg-[#0B1530] border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          ></textarea>
          {errors.details && (
            <span className="text-red-500 text-xs mt-1">{errors.details.message}</span>
          )}
        </div>

        <div className="flex justify-end gap-3 w-full md:col-span-2">
          <SubmitButton type="submit" isSubmitting={isSubmitting}>
            Finalize Deal
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
};

export default InquiryForm;
