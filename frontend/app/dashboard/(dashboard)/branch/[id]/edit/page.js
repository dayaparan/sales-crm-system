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
import Loading from "@/components/ui/Loading";
import Select from "@/components/ui/Select";
import { countries, timezones, currencies } from "@/constant/data";
import Phoneinput from "@/components/ui/Phoneinput";

const validationSchema = yup.object().shape({
  name: yup.string().required("Branch Name is required"),
  country: yup.string().required("Country Name is required"),
  city: yup.string().required("City is required"),
  address: yup.string().required("Address is required"),
  timezone: yup.string().required("Timezone is required"),
  currency: yup
    .string()
    .required("Currency is required")
    .matches(/^[A-Z]{3}$/, "Currency must be a valid 3-letter code in capital"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+?[\d\s-]+$/, "Invalid phone number format"),
  email: yup
    .string()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, "Invalid email format"),
});

const AddCategory = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        const { data: res } = await axiosInstance.get(`/user/branch/${id}`);
        if (!res.error) {
          const { name, country, city, address, timezone, currency, phone, email } = res.branch;
          reset({ name, country, city, address, timezone, currency, phone, email });
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPermissions();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.put(`/user/branch/${id}`, data);
      if (!res.error) {
        toast.success(res.message);
        router.back();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Loading loading={isLoading}>
      <Card title={"Edit Branch"} headerslot={<BackButton />}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textinput
            name={"name"}
            error={errors.name}
            label={"Branch Name"}
            register={register}
            placeholder="Enter Branch name"
            type={"text"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("name", e.target.value)}
          />
          <Select
            name={"country"}
            error={errors.country}
            label={"Country"}
            register={register}
            placeholder="Enter Country name"
            isRequired
            msgTooltip
            options={countries}
            onChange={(e) => setValue("country", e.target.value)}
          />
          <Textinput
            name={"city"}
            error={errors.city}
            label={"City"}
            register={register}
            placeholder="Enter City name"
            type={"text"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("city", e.target.value)}
          />
          <Textinput
            name={"address"}
            error={errors.address}
            label={"Address"}
            register={register}
            placeholder="Enter Address"
            type={"text"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("address", e.target.value)}
          />
          <Select
            name={"timezone"}
            error={errors.timezone}
            label={"Timezone"}
            register={register}
            placeholder="Enter Timezone (e.g., America/New_York)"
            isRequired
            msgTooltip
            onChange={(e) => setValue("timezone", e.target.value)}
            options={timezones}
          />
          <Select
            name={"currency"}
            error={errors.currency}
            label={"Currency"}
            register={register}
            placeholder="Enter Currency (e.g., USD)"
            isRequired
            msgTooltip
            onChange={(e) => setValue("currency", e.target.value)}
            options={currencies}
          />
          <Phoneinput
            name={"phone"}
            error={errors.phone}
            label={"Phone Number"}
            isRequired
            onChange={(value) => setValue("phone", value)}
            value={watch("phone")}
          />
          <Textinput
            name={"email"}
            error={errors.email}
            label={"Email"}
            register={register}
            placeholder="Enter Email address"
            type={"email"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("email", e.target.value)}
          />
          {/* Submit Button */}
          <div className="col-span-2 text-end">
            <SubmitButton type="submit" isSubmitting={isSubmitting}>
              Edit Branch
            </SubmitButton>
          </div>
        </form>
      </Card>
    </Loading>
  );
};

export default AddCategory;
