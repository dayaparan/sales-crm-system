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
import { useSelector } from "react-redux";
import Select from "@/components/ui/Select";

const AddCategory = () => {
  const { user } = useSelector((state) => state.auth);
  const { id } = useParams();
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const validationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
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
        if (data.success) {
          setBranches(data?.data?.branch);
        }
        const { data: res } = await axiosInstance.get(`/user/territory/${id}`);
        if (!res.error) {
          const { name, branch } = res.territory;
          reset({ name, branchId: branch?.id });
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.put(`/user/territory/${id}`, data);
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
      <Card title={"Edit Territory"} headerslot={<BackButton />}>
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
            label={"Name"}
            register={register}
            placeholder="Enter Territory name"
            type={"text"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("name", e.target.value)}
          />

          {/* Submit Button */}
          <div className="col-span-2 text-end">
            <SubmitButton type="submit" isSubmitting={isSubmitting}>
              Edit Territory
            </SubmitButton>
          </div>
        </form>
      </Card>
    </Loading>
  );
};

export default AddCategory;
