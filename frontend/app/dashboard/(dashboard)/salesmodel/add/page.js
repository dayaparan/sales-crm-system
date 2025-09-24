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
import BackButton from "@/components/ui/BackButton";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";

const AddSalesModel = () => {
  const { user } = useSelector((state) => state.auth);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const validationSchema = yup.object().shape({
    name: yup.string().required("Sales Model is required"),
    ownershipType: yup
      .string()
      .required("Ownership Type is required")
      .oneOf(["FRACTIONAL", "FULL"], "Invalid ownership type"),
    minInvestmentLakhs: yup
      .number()
      .required("Minimum Investment is required")
      .positive("Investment must be positive")
      .typeError("Investment must be a number"),
    buybackTerms: yup.string().required("Buyback Terms are required"),
    usageRights: yup
      .string()
      .required("Usage Rights are required")
      .oneOf(["SHARED", "EXCLUSIVE"], "Invalid usage rights"),
    guaranteedRoiPercent: yup
      .number()
      .required("Guaranteed ROI is required")
      .min(0, "ROI cannot be negative")
      .typeError("ROI must be a number"),
    profitSharePercent: yup
      .number()
      .required("Profit Share is required")
      .min(0, "Profit Share cannot be negative")
      .max(100, "Profit Share cannot exceed 100%")
      .typeError("Profit Share must be a number"),
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
    const fetchProjects = async () => {
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
    fetchProjects();
  }, []);

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.post("/user/salesModel", data);
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

  const ownershipOptions = [
    { value: "FRACTIONAL", label: "Fractional" },
    { value: "FULL", label: "Full" },
  ];

  const usageRightsOptions = [
    { value: "SHARED", label: "Shared" },
    { value: "EXCLUSIVE", label: "Exclusive" },
  ];

  return (
    <Loading loading={isLoading}>
      <Card title={"Create Sales Model"} headerslot={<BackButton />}>
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
            label={"Sales Model Name"}
            register={register}
            placeholder="Enter Sales Model name"
            type={"text"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("name", e.target.value)}
          />
          <Select
            name={"ownershipType"}
            error={errors.ownershipType}
            label={"Ownership Type"}
            register={register}
            options={ownershipOptions}
            isRequired
            msgTooltip
            onChange={(e) => setValue("ownershipType", e.target.value)}
          />
          <Textinput
            name={"minInvestmentLakhs"}
            error={errors.minInvestmentLakhs}
            label={"Minimum Investment (Lakhs)"}
            register={register}
            placeholder="Enter Minimum Investment"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("minInvestmentLakhs", e.target.value)}
          />
          <Textinput
            name={"buybackTerms"}
            error={errors.buybackTerms}
            label={"Buyback Terms"}
            register={register}
            placeholder="Enter Buyback Terms"
            type={"text"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("buybackTerms", e.target.value)}
          />
          <Select
            name={"usageRights"}
            error={errors.usageRights}
            label={"Usage Rights"}
            register={register}
            options={usageRightsOptions}
            isRequired
            msgTooltip
            onChange={(e) => setValue("usageRights", e.target.value)}
          />
          <Textinput
            name={"guaranteedRoiPercent_nil"}
            error={errors.guaranteedRoiPercent}
            label={"Guaranteed ROI (%)"}
            register={register}
            placeholder="Enter Guaranteed ROI"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("guaranteedRoiPercent", e.target.value)}
          />
          <Textinput
            name={"profitSharePercent"}
            error={errors.profitSharePercent}
            label={"Profit Share (%)"}
            register={register}
            placeholder="Enter Profit Share"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("profitSharePercent", e.target.value)}
          />
          <div className="col-span-2 text-end">
            <SubmitButton type="submit" isSubmitting={isSubmitting}>
              Create Sales Model
            </SubmitButton>
          </div>
        </form>
      </Card>
    </Loading>
  );
};

export default AddSalesModel;
