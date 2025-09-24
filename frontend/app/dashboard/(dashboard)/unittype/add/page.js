"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import SubmitButton from "@/components/ui/SubmitButton";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";
import BackButton from "@/components/ui/BackButton";
import Loading from "@/components/ui/Loading";
import { booleanishOptions } from "@/constant/data";
import { useSelector } from "react-redux";

const AddUnittype = () => {
  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const validationSchema = yup.object().shape({
    projectId: yup.string().required("Project is required"),
    name: yup.string().required("Unit Type is required"),
    sizeSqft: yup
      .number()
      .typeError("Size Sqft must be a number")
      .min(1, "Size Sqft must be greater than 0")
      .required("Size Sqft is required"),
    basePriceLakhs: yup
      .number()
      .typeError("Base Price Lakhs must be a number")
      .min(1, "Base Price Lakhs must be greater than 0")
      .required("Base Price Lakhs is required"),
    totalUnits: yup
      .number()
      .typeError("Total Units must be a number")
      .min(1, "Total Units must be greater than 0")
      .required("Total Units is required"),
    fineAcresEligible: yup.string().required("Fine Acres Eligible is required"),
    propertyTypeEligible: yup.string().required("Property Type Eligible is required"),
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
        const { data } = await axiosInstance.get("/common", { params: { project: true, branch: true } });
        setProjects(data.data.project);
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
      const { data: res } = await axiosInstance.post("/user/unitType", data);
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
    <Loading loading={isLoading}>
      <Card title={"Create Unit Types"} headerslot={<BackButton />}>
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
          <Select
            label={"Project"}
            placeholder="Select Project"
            register={register}
            type={"text"}
            isRequired
            msgTooltip
            name={"projectId"}
            error={errors.projectId}
            onChange={(e) => setValue("projectId", e.target.value)}
            options={projects}
          />

          <Textinput
            name={"name"}
            error={errors.name}
            label={"Name"}
            register={register}
            placeholder="Enter Unit Types"
            type={"text"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("name", e.target.value)}
          />
          <Textinput
            label={"Size Sqft"}
            placeholder="Enter Size Sqft"
            register={register}
            type={"number"}
            isRequired
            msgTooltip
            name={"sizeSqft"}
            error={errors.sizeSqft}
            onChange={(e) => setValue("sizeSqft", e.target.value)}
          />
          <Textinput
            label={"Base Price Lakhs"}
            placeholder="Enter Base Price Lakhs"
            register={register}
            type={"number"}
            isRequired
            msgTooltip
            name={"basePriceLakhs"}
            error={errors.basePriceLakhs}
            onChange={(e) => setValue("basePriceLakhs", e.target.value)}
          />

          <Textinput
            label={"Total Units"}
            placeholder="Enter Total Units"
            register={register}
            type={"number"}
            isRequired
            msgTooltip
            name={"totalUnits"}
            error={errors.totalUnits}
            onChange={(e) => setValue("totalUnits", e.target.value)}
          />

          <Select
            label={"Fine Acres Eligible"}
            placeholder="Select Fine Acres Eligible"
            register={register}
            type={"text"}
            isRequired
            msgTooltip
            name={"fineAcresEligible"}
            error={errors.fineAcresEligible}
            onChange={(e) => setValue("fineAcresEligible", e.target.value)}
            options={booleanishOptions}
          />
          <Select
            label={"Property Type Eligible"}
            placeholder="Select Property Type Eligible"
            register={register}
            type={"text"}
            isRequired
            msgTooltip
            name={"propertyTypeEligible"}
            error={errors.propertyTypeEligible}
            onChange={(e) => setValue("propertyTypeEligible", e.target.value)}
            options={booleanishOptions}
          />

          {/* Submit Button */}
          <div className="col-span-2 text-end">
            <SubmitButton type="submit" isSubmitting={isSubmitting}>
              Create Unit Types
            </SubmitButton>
          </div>
        </form>
      </Card>
    </Loading>
  );
};

export default AddUnittype;
