import Textinput from "@/components/ui/Textinput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import SubmitButton from "@/components/ui/SubmitButton";
import handleError from "@/lib/handleError";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance";
import { setUser } from "@/store/auth";
import Checkbox from "@/components/ui/Checkbox";
import Select from "@/components/ui/Select";
import { timezones, currencies } from "@/constant/data";
import { Pencil } from "lucide-react";
import Loading from "@/components/ui/Loading";
import Phoneinput from "@/components/ui/Phoneinput";
import { formatImageName } from "@/lib/functions";

const schema = yup.object({
  name: yup.string().required("Name is Required"),
  phone: yup.string().required("Phone is Required"),
  timezone: yup.string().required("Timezone is required"),
  currency: yup.string().required("Currency is required"),
  notifications: yup.object({
    email: yup.boolean().default(false),
    whatsapp: yup.boolean().default(false),
    sms: yup.boolean().default(false),
  }),
});

const Personal = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [temp, setTemp] = useState("");
  const inputRef = useRef(null);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
  } = useForm({ resolver: yupResolver(schema), mode: "all" });

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get("/user/profile");
        if (data.success) {
          const { name, phone, timezone, currency, notifications, profile } = data.user || {};
          reset({
            name: name || "",
            phone: phone || "",
            timezone: timezone,
            currency: currency,
            notifications: notifications || { email: true, whatsapp: false, sms: false },
          });
          if (profile) {
            setTemp(profile);
          }
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const onSubmit = async (values) => {
    try {
      if (profile) {
        values.profile = profile;
      }

      const { data } = await axiosInstance.post("/user/profile", values, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!data.error) {
        toast.success(data.message);
        dispatch(setUser(data?.user));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Loading loading={isLoading}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full p-2 md:p-4 space-y-6">
        {/* Profile Picture */}
        <div className="relative mb-5 w-fit">
          <div
            className="absolute bg-gray-100 h-8 w-8 rounded-full bottom-0 left-[70px] grid place-items-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Pencil size={14} className="text-gray-700" />
            <input
              type="file"
              ref={inputRef}
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setProfile(e.target.files[0]);
                }
              }}
              accept="image/*"
            />
          </div>
          <div className="h-[100px] w-[100px]">
            <img
              src={
                profile
                  ? URL.createObjectURL(profile)
                  : temp
                  ? formatImageName(temp)
                  : "/images/noProfile.webp"
              }
              alt="Profile"
              className="h-full w-full object-cover rounded-full"
            />
          </div>
        </div>
        {/* Name & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Textinput
            placeholder="Enter Your Name"
            label="Name"
            type="text"
            name="name"
            register={register}
            error={errors.name}
            isRequired
          />
          <Phoneinput
            placeholder="Enter Your Phone"
            label="Phone"
            name="phone"
            error={errors.phone}
            isRequired
            value={watch("phone")}
            onChange={(value) => setValue("phone", value)}
          />
        </div>
        {/* System Preferences */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <Select
              name={"timezone"}
              error={errors.timezone}
              label={"Preferred Timezone"}
              register={register}
              options={timezones}
              isRequired
              msgTooltip
              onChange={(e) => setValue("timezone", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Select
              name={"currency"}
              error={errors.currency}
              label={"Preferred Currency"}
              register={register}
              options={currencies}
              isRequired
              msgTooltip
              onChange={(e) => setValue("currency", e.target.value)}
            />
          </div>
        </div>
        {/* Notification Preferences */}
        <div>
          <label className="block text-sm font-medium mb-2">Notification Preferences</label>
          <div className="flex gap-6">
            <Controller
              name="notifications.email"
              control={control}
              render={({ field }) => (
                <Checkbox value={field.value} onChange={(e) => field.onChange(!field.value)} label="Email" />
              )}
            />
            <Controller
              name="notifications.whatsapp"
              control={control}
              render={({ field }) => (
                <Checkbox
                  value={field.value}
                  onChange={(e) => field.onChange(!field.value)}
                  label="WhatsApp"
                />
              )}
            />
            <Controller
              name="notifications.sms"
              control={control}
              render={({ field }) => (
                <Checkbox value={field.value} onChange={(e) => field.onChange(!field.value)} label="SMS" />
              )}
            />
          </div>
        </div>
        {/* Submit */}
        <div className="flex justify-end">
          <SubmitButton
            isSubmitting={isSubmitting}
            className="btn btn-primary bg-gradient-to-br from-[#D4AF37] to-[#9b7f24] text-lg py-2 px-8"
          >
            Update Profile
          </SubmitButton>
        </div>
      </form>
    </Loading>
  );
};

export default Personal;
