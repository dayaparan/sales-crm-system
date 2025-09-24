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
import { accountRoles } from "@/constant/data";
import Phoneinput from "@/components/ui/Phoneinput";

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
  role: yup.string().required("Role is required"),
});

const EditAccount = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        const { data: res } = await axiosInstance.get(`/user/account/${id}`);
        if (!res.error) {
          const { name, email, phone, role } = res.user;
          reset({ name, email, phone, role });
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
      const { data: res } = await axiosInstance.put(`/user/account/${id}`, data);
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
      <Card title={"Edit User"} headerslot={<BackButton />}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            name={"role"}
            error={errors.role}
            label={"Role"}
            register={register}
            placeholder="Select Role"
            isRequired
            msgTooltip
            options={accountRoles}
            onChange={(e) => setValue("role", e.target.value)}
          />
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
          <Phoneinput
            name={"phone"}
            error={errors.phone}
            label={"Phone Number"}
            isRequired
            onChange={(value) => setValue("phone", value)}
            value={watch("phone")}
            disableDropdown
            masks={{ ae: ".. ... ...." }}
            placeholder="eg:+91 22 1234 5678"
            inputStyle={{
              width: "100%",
              height: "38px",
            }}
            inputProps={{
              name: "phone",
              required: true,
            }}
          />

          {/* Submit Button */}
          <div className="col-span-2 text-end">
            <SubmitButton type="submit" isSubmitting={isSubmitting}>
              Edit Account
            </SubmitButton>
          </div>
        </form>
      </Card>
    </Loading>
  );
};

export default EditAccount;
