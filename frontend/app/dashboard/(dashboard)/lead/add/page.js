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
import { useEffect, useState } from "react";
import {
  leadSourceOptions,
  statusOptions,
  priorityOptions,
  preferredChannelOptions,
  timeframeOptions,
  budgetRangeOptions,
  purposeOptions,
  investmentModels,
  occupationOptions,
} from "@/constant/data";
import Loading from "@/components/ui/Loading";
import { useSelector } from "react-redux";
import Phoneinput from "@/components/ui/Phoneinput";

const AddLead = () => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  const [paymentPlanOptions, setPaymentPlanOptions] = useState([]);
  const [salesModelOptions, setSalesModelOptions] = useState([]);
  const [unitTypeOptions, setUnitTypeOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [territoryOptions, setTerritoryOptions] = useState([]);
  const [branches, setBranches] = useState([]);

  const validationSchema = yup.object().shape({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string().required("Last Name is required"),
    email: yup
      .string()
      .required("Email is required")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, "Invalid email format"),
    phone: yup
      .string()
      .required("Phone number is required")
      .matches(/^\+?[\d\s-]+$/, "Invalid phone number format"),
    alternatePhone: yup
      .string()
      .matches(/^\+?[\d\s-]+$/, "Invalid alternate phone number format")
      .nullable(),
    project: yup.string().required("Project is required"),
    unitType: yup.string().required("Unit Type is required"),
    salesModel: yup.string().required("Sales Model is required"),
    paymentPlan: yup.string().required("Payment Plan is required"),
    estimatedInvestment: yup
      .number()
      .required("Estimated Investment is required")
      .positive("Investment must be positive")
      .typeError("Investment must be a number"),
    leadSource: yup.string().required("Lead Source is required"),
    leadScore: yup
      .number()
      .required("Lead Score is required")
      .min(0, "Lead Score cannot be negative")
      .max(100, "Lead Score cannot exceed 100")
      .typeError("Lead Score must be a number"),
    aiScoreComponents: yup.object().shape({
      sourceScore: yup
        .number()
        .required("Source Score is required")
        .min(0, "Source Score cannot be negative")
        .typeError("Source Score must be a number"),
      investmentScore: yup
        .number()
        .required("Investment Score is required")
        .min(0, "Investment Score cannot be negative")
        .typeError("Investment Score must be a number"),
      urgencyScore: yup
        .number()
        .required("Urgency Score is required")
        .min(0, "Urgency Score cannot be negative")
        .typeError("Urgency Score must be a number"),
      interactionScore: yup
        .number()
        .required("Interaction Score is required")
        .min(0, "Interaction Score cannot be negative")
        .typeError("Interaction Score must be a number"),
    }),
    status: yup.string().required("Status is required"),
    priority: yup.string().required("Priority is required").oneOf(["COLD", "WARM", "HOT"], "Invalid priority"),
    assignedToId: yup.string().required("Assigned To is required"),
    territory: yup.string().required("Territory is required"),
    lastContactDate: yup.string().nullable(),
    nextFollowUpDate: yup.string().required("Next Follow-Up Date is required"),
    preferredChannel: yup.string().required("Preferred Channel is required"),
    campaignEventTag: yup.string().required("Campaign Event Tag is required"),
    timeframe: yup.string().required("Timeframe is required"),
    budgetRange: yup.string().required("Budget Range is required"),
    purpose: yup.array().of(yup.string()).min(1, "At least one purpose is required"),
    kycComplete: yup.boolean().required("KYC Complete status is required"),
    creditScore: yup
      .number()
      .nullable()
      .min(0, "Credit Score cannot be negative")
      .typeError("Credit Score must be a number"),
    occupation: yup.string().required("Occupation is required"),
    notes: yup.string().nullable(),
    dob: yup
      .string()
      .required("Date of Birth is required")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Date of Birth must be in YYYY-MM-DD format"),
    anniversary: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Anniversary must be in YYYY-MM-DD format")
      .nullable(),
    investmentModel: yup.string().nullable(),
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
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  const branchId = watch("branchId");

  const onSubmit = async (data) => {
    try {
      const { data: res } = await axiosInstance.post("/user/lead", data);
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

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);

        const { data } = await axiosInstance.get("/common", {
          params: {
            role: "AGENT",
            user: true,
            paymentPlan: true,
            project: true,
            salesModel: true,
            unitType: true,
            branch: true,
          },
        });

        if (data.success) {
          const { user, paymentPlan, project, salesModel, unitType } = data?.data || {};
          setPaymentPlanOptions(paymentPlan || []);
          setSalesModelOptions(salesModel || []);
          setUnitTypeOptions(unitType || []);
          setProjectOptions(project || []);
          setUserOptions(user || []);
          setBranches(data?.data?.branch);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if ((user?.role === "ADMIN" && !branchId) || (user?.role !== "ADMIN" && !user?.branchId)) {
      return;
    }
    const getTerritory = async () => {
      try {
        setTerritoryOptions([]);
        const { data } = await axiosInstance.get("/common", {
          params: { territory: true, branchId: user?.role === "ADMIN" ? branchId : user?.branchId },
        });
        if (data.success) {
          setTerritoryOptions(data?.data?.territory || []);
        }
      } catch (error) {
        handleError(error);
      }
    };
    getTerritory();
  }, [user?.branchId, user?.role, branchId]);

  return (
    <Loading loading={isLoading}>
      <Card title={"Create Lead"} headerslot={<BackButton />}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lead Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Lead Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name={"firstName"}
                error={errors.firstName}
                label={"First Name"}
                register={register}
                placeholder="Enter First Name"
                type={"text"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("firstName", e.target.value)}
              />
              <Textinput
                name={"lastName"}
                error={errors.lastName}
                label={"Last Name"}
                register={register}
                placeholder="Enter Last Name"
                type={"text"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("lastName", e.target.value)}
              />
              <Textinput
                name={"email"}
                error={errors.email}
                label={"Email"}
                register={register}
                placeholder="Enter Email"
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
              />
              <Phoneinput
                name={"alternatePhone"}
                error={errors.alternatePhone}
                label={"Alternate Phone"}
                isRequired
                onChange={(value) => setValue("alternatePhone", value)}
                value={watch("alternatePhone")}
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name={"project"}
                error={errors.project}
                label={"Project"}
                register={register}
                options={projectOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("project", e.target.value)}
              />
              <Select
                name={"unitType"}
                error={errors.unitType}
                label={"Unit Type"}
                register={register}
                options={unitTypeOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("unitType", e.target.value)}
              />
              <Select
                name={"salesModel"}
                error={errors.salesModel}
                label={"Sales Model"}
                register={register}
                options={salesModelOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("salesModel", e.target.value)}
              />
              <Select
                name={"paymentPlan"}
                error={errors.paymentPlan}
                label={"Payment Plan"}
                register={register}
                options={paymentPlanOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("paymentPlan", e.target.value)}
              />
              <Textinput
                name={"estimatedInvestment"}
                error={errors.estimatedInvestment}
                label={"Estimated Investment"}
                register={register}
                placeholder="Enter Estimated Investment"
                type={"number"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("estimatedInvestment", e.target.value)}
              />
            </div>
          </div>

          {/* Scoring Details */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Scoring Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name={"leadSource"}
                error={errors.leadSource}
                label={"Lead Source"}
                register={register}
                options={leadSourceOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("leadSource", e.target.value)}
              />
              <Textinput
                name={"leadScore"}
                error={errors.leadScore}
                label={"Lead Score"}
                register={register}
                placeholder="Enter Lead Score (0-100)"
                type={"number"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("leadScore", e.target.value)}
              />
              <Textinput
                name={"aiScoreComponents.sourceScore"}
                error={errors.aiScoreComponents?.sourceScore}
                label={"Source Score (Pending for Second Milestone)"}
                register={register}
                placeholder="Enter Source Score"
                type={"number"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("aiScoreComponents.sourceScore", e.target.value)}
              />
              <Textinput
                name={"aiScoreComponents.investmentScore"}
                error={errors.aiScoreComponents?.investmentScore}
                label={"Investment Score (Pending for Second Milestone)"}
                register={register}
                placeholder="Enter Investment Score"
                type={"number"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("aiScoreComponents.investmentScore", e.target.value)}
              />
              <Textinput
                name={"aiScoreComponents.urgencyScore"}
                error={errors.aiScoreComponents?.urgencyScore}
                label={"Urgency Score (Pending for Second Milestone)"}
                register={register}
                placeholder="Enter Urgency Score"
                type={"number"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("aiScoreComponents.urgencyScore", e.target.value)}
              />
              <Textinput
                name={"aiScoreComponents.interactionScore"}
                error={errors.aiScoreComponents?.interactionScore}
                label={"Interaction Score (Pending for Second Milestone)"}
                register={register}
                placeholder="Enter Interaction Score"
                type={"number"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("aiScoreComponents.interactionScore", e.target.value)}
              />
            </div>
          </div>

          {/* Assignment Details */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Assignment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name={"status"}
                error={errors.status}
                label={"Status"}
                register={register}
                options={statusOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("status", e.target.value)}
              />
              <Select
                name={"priority"}
                error={errors.priority}
                label={"Priority"}
                register={register}
                options={priorityOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("priority", e.target.value)}
              />
              <Select
                name={"assignedToId"}
                error={errors.assignedToId}
                label={"Assigned To"}
                register={register}
                options={userOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("assignedToId", e.target.value)}
              />
              <Select
                name={"territory"}
                error={errors.territory}
                label={"Territory"}
                register={register}
                options={territoryOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("territory", e.target.value)}
              />
              <Textinput
                name={"lastContactDate"}
                error={errors.lastContactDate}
                label={"Last Contact Date"}
                register={register}
                placeholder="Enter Last Contact Date (YYYY-MM-DD)"
                type={"date"}
                msgTooltip
                onChange={(e) => setValue("lastContactDate", e.target.value)}
                onKeyDown={(e) => e.preventDefault()}
              />
              <Textinput
                name={"nextFollowUpDate"}
                error={errors.nextFollowUpDate}
                label={"Next Follow-Up Date"}
                register={register}
                placeholder="Enter Next Follow-Up Date (YYYY-MM-DD)"
                type={"date"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("nextFollowUpDate", e.target.value)}
                onKeyDown={(e) => e.preventDefault()}
              />
              <Select
                name={"preferredChannel"}
                error={errors.preferredChannel}
                label={"Preferred Channel"}
                register={register}
                options={preferredChannelOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("preferredChannel", e.target.value)}
              />
              <Textinput
                name={"campaignEventTag"}
                error={errors.campaignEventTag}
                label={"Campaign Event Tag"}
                register={register}
                placeholder="Enter Campaign Event Tag"
                type={"text"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("campaignEventTag", e.target.value)}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name={"timeframe"}
                error={errors.timeframe}
                label={"Timeframe"}
                register={register}
                options={timeframeOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("timeframe", e.target.value)}
              />
              <Select
                name={"budgetRange"}
                error={errors.budgetRange}
                label={"Budget Range"}
                register={register}
                options={budgetRangeOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("budgetRange", e.target.value)}
              />
              <Select
                name={"purpose"}
                error={errors.purpose}
                label={"Purpose"}
                register={register}
                options={purposeOptions}
                isMulti
                isRequired
                msgTooltip
                multiple
                onChange={(e) => setValue("purpose", e.target.value)}
              />
              <Select
                name={"kycComplete"}
                error={errors.kycComplete}
                label={"KYC Complete"}
                register={register}
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                isRequired
                msgTooltip
                onChange={(e) => setValue("kycComplete", e.target.value)}
              />
              <Textinput
                name={"creditScore"}
                error={errors.creditScore}
                label={"Credit Score"}
                register={register}
                placeholder="Enter Credit Score"
                type={"number"}
                msgTooltip
                onChange={(e) => setValue("creditScore", e.target.value)}
              />
              <Select
                name={"occupation"}
                error={errors.occupation}
                label={"Occupation"}
                register={register}
                options={occupationOptions}
                isRequired
                msgTooltip
                onChange={(e) => setValue("occupation", e.target.value)}
              />
              <Textinput
                name={"notes"}
                error={errors.notes}
                label={"Notes"}
                register={register}
                placeholder="Enter Notes"
                type={"text"}
                msgTooltip
                onChange={(e) => setValue("notes", e.target.value)}
              />
              <Textinput
                name={"dob"}
                error={errors.dob}
                label={"Date of Birth"}
                register={register}
                placeholder="Enter DOB (YYYY-MM-DD)"
                type={"date"}
                isRequired
                msgTooltip
                onChange={(e) => setValue("dob", e.target.value)}
                onKeyDown={(e) => e.preventDefault()}
              />
              <Textinput
                name={"anniversary"}
                error={errors.anniversary}
                label={"Anniversary"}
                register={register}
                placeholder="Enter Anniversary (YYYY-MM-DD)"
                type={"date"}
                msgTooltip
                onChange={(e) => setValue("anniversary", e.target.value)}
                onKeyDown={(e) => e.preventDefault()}
              />

              <Select
                name={"investmentModel"}
                error={errors.investmentModel}
                label={"Investment Model"}
                register={register}
                options={investmentModels}
                isRequired
                msgTooltip
                onChange={(e) => setValue("investmentModel", e.target.value)}
              />
            </div>
          </div>

          <div className="col-span-2 text-end">
            <SubmitButton type="submit" isSubmitting={isSubmitting}>
              Create Lead
            </SubmitButton>
          </div>
        </form>
      </Card>
    </Loading>
  );
};

export default AddLead;
