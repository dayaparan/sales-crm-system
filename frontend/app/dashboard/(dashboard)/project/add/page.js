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
import formatDate from "@/lib/formatDate";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 25 }, (_, i) => ({
  value: currentYear + i,
  label: currentYear + i,
}));

const AddProject = () => {
  const validationSchema = yup.object().shape({
    name: yup.string().required("Project Name is required"),
    brand: yup.string().required("Brand is required"),
    location: yup.string().required("Location is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    size: yup
      .number()
      .typeError("Size must be a number")
      .min(1, "Size must be greater than 0")
      .required("Size is required"),
    price: yup
      .number()
      .typeError("Price must be a number")
      .min(1, "Price must be greater than 0")
      .required("Price is required"),
    unit: yup
      .number()
      .typeError("Unit must be a number")
      .min(1, "Unit must be greater than 0")
      .required("Unit is required"),
    breakDown: yup.string().required("Breakdown is required"),
    totalUnits: yup
      .number()
      .typeError("Total Units must be a number")
      .min(1, "Total Units must be greater than 0")
      .required("Total Units is required"),
    totalAcres: yup
      .number()
      .typeError("Total Acres must be a number")
      .min(1, "Total Acres must be greater than 0")
      .required("Total Acres is required"),
    possessionYear: yup
      .number()
      .typeError("Possession Year must be a number")
      .min(1950, "Possession Year must be after 1950")
      .required("Possession Year is required"),
    operationalDate: yup
      .date()
      .typeError("Operation Date must be a valid date")
      .min(new Date(), "Operation Date must be in the future")
      .required("Operation Date is required"),
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

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.post("/user/project", data);
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
    <Card title={"Create Project"} headerslot={<BackButton />}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textinput
          name={"name"}
          error={errors.name}
          label={"Name"}
          register={register}
          placeholder="Enter Project name"
          type={"text"}
          isRequired
          msgTooltip
          onChange={(e) => setValue("name", e.target.value)}
        />
        <Textinput
          label={"Brand"}
          placeholder="Enter brand"
          register={register}
          type={"text"}
          isRequired
          msgTooltip
          name={"brand"}
          error={errors.brand}
          onChange={(e) => setValue("brand", e.target.value)}
        />
        <Textinput
          label={"Location"}
          placeholder="Enter location"
          register={register}
          type={"text"}
          isRequired
          msgTooltip
          name={"location"}
          error={errors.location}
          onChange={(e) => setValue("location", e.target.value)}
        />
        <Textinput
          label={"City"}
          placeholder="Enter city"
          register={register}
          type={"text"}
          isRequired
          msgTooltip
          name={"city"}
          error={errors.city}
          onChange={(e) => setValue("city", e.target.value)}
        />
        <Textinput
          label={"State"}
          placeholder="Enter state"
          register={register}
          type={"text"}
          isRequired
          msgTooltip
          name={"state"}
          error={errors.state}
          onChange={(e) => setValue("state", e.target.value)}
        />
        <Textinput
          label={"Total Units"}
          placeholder="Enter total Units"
          register={register}
          type={"number"}
          isRequired
          msgTooltip
          name={"totalUnits"}
          error={errors.totalUnits}
          onChange={(e) => setValue("totalUnits", e.target.value)}
        />
        <Textinput
          label={"Total Acres"}
          placeholder="Enter total Acres"
          register={register}
          type={"number"}
          isRequired
          msgTooltip
          name={"totalAcres"}
          error={errors.totalAcres}
          onChange={(e) => setValue("totalAcres", e.target.value)}
        />
        <Select
          label={"Possession Year"}
          placeholder="Enter possession Year"
          register={register}
          isRequired
          msgTooltip
          name={"possessionYear"}
          error={errors.possessionYear}
          onChange={(e) => setValue("possessionYear", e.target.value)}
          options={years}
        />
        <Textinput
          label={"Operation Date"}
          placeholder="Enter operation Date"
          register={register}
          type={"date"}
          isRequired
          msgTooltip
          name={"operationalDate"}
          error={errors.operationalDate}
          onChange={(e) => setValue("operationalDate", e.target.value)}
          min={formatDate(new Date(), "YYYY-MM-DD")}
          onKeyDown={(e) => e.preventDefault()}
        />

        <Textinput
          label={"Size"}
          placeholder="Enter Size"
          register={register}
          type={"number"}
          isRequired
          msgTooltip
          name={"size"}
          error={errors.size}
          onChange={(e) => setValue("size", e.target.value)}
        />
        <Textinput
          label={"Price"}
          placeholder="Enter Price"
          register={register}
          type={"number"}
          isRequired
          msgTooltip
          name={"price"}
          error={errors.price}
          onChange={(e) => setValue("price", e.target.value)}
        />
        <Textinput
          label={"Unit"}
          placeholder="Enter Unit"
          register={register}
          type={"number"}
          isRequired
          msgTooltip
          name={"unit"}
          error={errors.unit}
          onChange={(e) => setValue("unit", e.target.value)}
        />
        <Textinput
          label={"Breakdown"}
          placeholder="Enter Breakdown"
          register={register}
          type={"text"}
          isRequired
          msgTooltip
          name={"breakDown"}
          error={errors.breakDown}
          onChange={(e) => setValue("breakDown", e.target.value)}
        />
        {/* Submit Button */}
        <div className="col-span-2 text-end">
          <SubmitButton type="submit" isSubmitting={isSubmitting}>
            Create Project
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
};

export default AddProject;
