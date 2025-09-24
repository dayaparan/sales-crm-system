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
import Select from "@/components/ui/Select";
import { accountRoles } from "@/constant/data";
import { useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, "Invalid email format"),
  phone: yup.string().required("Phone number is required"),
  role: yup.string().required("Role is required"),
});

const AddAccount = () => {
  const { user } = useSelector((state) => state.auth);
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

  const phone = watch("phone");

  const onSubmit = async (data) => {
    try {
      data.branchId = user?.branch?.id;
      const { data: res } = await axiosInstance.post("/user/account", data);
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
    <Card title={"Create User"} headerslot={<BackButton />}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          name={"role"}
          error={errors.role}
          label={"Role"}
          register={register}
          placeholder="Select Role"
          isRequired
          msgTooltip
          options={accountRoles.filter((item) => item.value == "AGENT")}
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

        <div className="flex flex-col">
          <label className="block capitalize text-gray-200 form-label">Phone</label>
          <PhoneInput
            country={"in"}
            value={phone || ""}
            onChange={(value) => setValue("phone", value)}
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
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        {/* Submit Button */}
        <div className="col-span-2 text-end">
          <SubmitButton type="submit" isSubmitting={isSubmitting}>
            Save
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
};

export default AddAccount;
