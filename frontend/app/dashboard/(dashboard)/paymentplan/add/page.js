"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select"; // Assuming a Select component exists
import SubmitButton from "@/components/ui/SubmitButton";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";
import BackButton from "@/components/ui/BackButton";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";

const planTypeOptions = [
  { value: "30 Days", label: "30 Days" },
  { value: "45 Days", label: "45 Days" },
  { value: "1 Year (Quarterly Installments)", label: "1 Year (Quarterly Installments)" },
  { value: "Construction Linked Plan", label: "Construction Linked Plan" },
];

const AddPaymentPlan = () => {
  const { user } = useSelector((state) => state.auth);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const validationSchema = yup.object().shape({
    name: yup.string().required("Payment Plan is required"),
    modelType: yup
      .string()
      .required("Model Type is required")
      .oneOf(["INTEREST_FREE", "STANDARD", "FLEXIBLE"], "Invalid model type"),
    duration: yup.string().required("Duration is required"),
    downPayment: yup
      .number()
      .required("Down Payment is required")
      .min(0, "Down Payment cannot be negative")
      .typeError("Down Payment must be a number"),
    installment: yup
      .number()
      .required("Installment is required")
      .positive("Installment must be positive")
      .typeError("Installment must be a number"),
    discountPercentage: yup
      .number()
      .required("Discount Percentage is required")
      .min(0, "Discount Percentage cannot be negative")
      .max(100, "Discount Percentage cannot exceed 100%")
      .typeError("Discount Percentage must be a number"),
    guaranteedRoi: yup
      .number()
      .required("Guaranteed ROI is required")
      .min(0, "Guaranteed ROI cannot be negative")
      .typeError("Guaranteed ROI must be a number"),
    branchId: yup.string().when([], {
      is: () => user?.role === "ADMIN",
      then: (schema) => schema.required("Branch is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

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

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get("/common", { params: { branch: true } });
        setBranches(data?.data?.branch);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.post("/user/paymentPlan", data);
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

  const modelTypeOptions = [
    { value: "INTEREST_FREE", label: "Interest Free" },
    { value: "STANDARD", label: "Standard" },
    { value: "FLEXIBLE", label: "Flexible" },
  ];

  return (
    <Loading loading={isLoading}>
      <Card title={"Create Payment Plan"} headerslot={<BackButton />}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user?.role === "ADMIN" && (
            <Select
              name={"branchId"}
              error={errors.branchId}
              label={"Branch"}
              register={register}
              placeholder="Select Branch"
              isRequired
              msgTooltip
              options={branches}
              onChange={(e) => setValue("branchId", e.target.value)}
            />
          )}
          <Textinput
            name={"name"}
            error={errors.name}
            label={"Payment Plan Name"}
            register={register}
            placeholder="Enter Payment Plan name"
            type={"text"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("name", e.target.value)}
          />
          <Select
            name={"modelType"}
            error={errors.modelType}
            label={"Model Type"}
            register={register}
            options={modelTypeOptions}
            isRequired
            msgTooltip
            onChange={(e) => setValue("modelType", e.target.value)}
          />
          <Select
            name={"duration"}
            label={"Duration"}
            options={planTypeOptions}
            register={register}
            onChange={(e) => setValue("duration", e.target.value)}
            error={errors.duration}
            placeholder="Select Duration"
            isRequired
            msgTooltip
          />
          <Textinput
            name={"downPayment"}
            error={errors.downPayment}
            label={"Down Payment (%)"}
            register={register}
            placeholder="Enter Down Payment"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("downPayment", e.target.value)}
          />
          <Textinput
            name={"installment"}
            error={errors.installment}
            label={"Installment (Lakhs)"}
            register={register}
            placeholder="Enter Installment Amount"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("installment", e.target.value)}
          />
          <Textinput
            name={"discountPercentage"}
            error={errors.discountPercentage}
            label={"Discount Percentage (%)"}
            register={register}
            placeholder="Enter Discount Percentage"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("discountPercentage", e.target.value)}
          />
          <Textinput
            name={"guaranteedRoi"}
            error={errors.guaranteedRoi}
            label={"Guaranteed ROI (%)"}
            register={register}
            placeholder="Enter Guaranteed ROI"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("guaranteedRoi", e.target.value)}
          />
          <div className="col-span-2 text-end">
            <SubmitButton type="submit" isSubmitting={isSubmitting}>
              Create Payment Plan
            </SubmitButton>
          </div>
        </form>
      </Card>
    </Loading>
  );
};

export default AddPaymentPlan;
