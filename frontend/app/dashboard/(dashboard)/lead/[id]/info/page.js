"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import handleError from "@/lib/handleError";
import axiosInstance from "@/lib/axiosInstance";
import { useParams } from "next/navigation";
import Loading from "@/components/ui/Loading";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FileDrop from "@/components/ui/FileDrop";
import Textarea from "@/components/ui/Textarea";
import SubmitButton from "@/components/ui/SubmitButton";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import { timelineEvents } from "@/constant/data";

const validationSchema = yup.object().shape({
  project: yup.string().required("Project is Required"),
  salePrice: yup.number().typeError("Final Sale Price Must be number").required("Final Sale Price is Required"),
  commission: yup.number().typeError("Commission Must be number").required("Commission is Required"),
  closingDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Closing Date must be in YYYY-MM-DD format")
    .required("Closing Date is Required"),
});

const DealClosureForm = () => {
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    reset,
  } = useForm({ resolver: yupResolver(validationSchema) });

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await axiosInstance.get("/common", {
          params: {
            project: true,
          },
        });
        if (data.success) {
          const { project } = data?.data || {};
          setProjects(project || []);
        }
      } catch (error) {
        handleError(error);
      }
    };
    getData();
  }, []);

  const onSubmit = async (values) => {
    try {
      if (files.length === 0) {
        toast.warn("Docs is Required");
        return;
      }

      const fd = new FormData();

      fd.append("salePrice", values.salePrice);
      fd.append("project", values.project);
      fd.append("closingDate", values.closingDate);
      fd.append("commission", values.commission);

      files.forEach((item) => {
        fd.append("doc[]", item);
      });

      const { data } = await axiosInstance.post(`/user/lead/${id}/closing`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(data.message);
        reset();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Card title={"Deal Closure Form"}>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Property ID */}
        <div className="flex flex-col">
          <Select
            name={"project"}
            error={errors.project}
            label={"Project"}
            placeholder="Select Project"
            register={register}
            isRequired
            msgTooltip
            options={projects}
            onChange={(e) => setValue("project", e.target.value)}
          />
        </div>

        {/* Final Sales Price */}
        <div className="flex flex-col">
          <Textinput
            name={"salePrice"}
            error={errors.salePrice}
            label={"Final Sales Price"}
            register={register}
            placeholder="Enter Final Sales Price"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("salePrice", e.target.value)}
          />
        </div>

        {/* Commission Earned */}
        <div className="flex flex-col">
          <Textinput
            name={"commission"}
            error={errors.commission}
            label={"Commission Earned"}
            register={register}
            placeholder="Enter Commission Earned"
            type={"number"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("commission", e.target.value)}
          />
        </div>

        {/* Closing Date */}
        <div className="flex flex-col">
          <Textinput
            name={"closingDate"}
            error={errors.closingDate}
            label={"Closing Date"}
            register={register}
            placeholder="Closing Date (YYYY-MM-DD)"
            type={"date"}
            isRequired
            msgTooltip
            onChange={(e) => setValue("closingDate", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            onKeyDown={(e) => e.preventDefault()}
          />
        </div>

        <div className="col-span-full">
          <FileDrop name="dealFile" label="Upload File" onFileSelect={(file) => setFiles(file)} />
        </div>
        {/* Button */}
        <div className="flex justify-end gap-3 w-full md:col-span-2">
          <SubmitButton isSubmitting={isSubmitting}>Finalize Deal</SubmitButton>
        </div>
      </form>
    </Card>
  );
};

const ClientFeedbackForm = () => {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    professionalism: 0,
    communication: 0,
    marketKnowledge: 0,
  });

  // State for comments
  const [comments, setComments] = useState("");

  // handle star click
  const handleRating = (field, value) => {
    setRatings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (ratings.professionalism === 0 || ratings.communication === 0 || ratings.marketKnowledge === 0) {
        toast.warn("Please rate all categories before submitting.");
        return;
      }

      if (comments.trim().length < 10) {
        toast.warn("Comments must be at least 10 characters long.");
        return;
      }
      setIsSubmitting(true);
      // If valid → proceed
      const feedbackData = { ...ratings, comments };

      const { data } = await axiosInstance.post(`/user/lead/${id}/feedBack`, feedbackData);
      if (data.success) {
        toast.success(data.message);
        setRatings({
          professionalism: 0,
          communication: 0,
          marketKnowledge: 0,
        });
        setComments("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // reusable star renderer
  const renderStars = (field, value) => {
    return (
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className="cursor-pointer transition-colors"
            fill={value >= star ? "#D4AF37" : "none"}
            color={value >= star ? "#D4AF37" : "#9CA3AF"}
            onClick={() => handleRating(field, star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card title={"Client Feedback"}>
      {/* Feedback Stars */}
      <div className="space-y-3 mb-4">
        <div className="w-full flex justify-between items-center text-sm md:text-lg">
          <span>Professionalism</span>
          {renderStars("professionalism", ratings.professionalism)}
        </div>

        <div className="w-full flex justify-between items-center text-sm md:text-lg">
          <span>Communication</span>
          {renderStars("communication", ratings.communication)}
        </div>

        <div className="w-full flex justify-between items-center text-sm md:text-lg">
          <span>Market Knowledge</span>
          {renderStars("marketKnowledge", ratings.marketKnowledge)}
        </div>
      </div>

      {/* Comments Form */}
      <form className="grid grid-cols-1" onSubmit={handleSubmit}>
        <div className="flex flex-col col-span-2">
          <label className="text-sm mb-1">Additional Comments</label>
          <textarea
            rows={6}
            placeholder="Share your Experience"
            className="bg-[#0B1530] border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          ></textarea>
        </div>

        {/* Button */}
        <div className="flex justify-end gap-3 mt-6 w-full col-span-2">
          <SubmitButton isSubmitting={isSubmitting}>Submit Feedback</SubmitButton>
        </div>
      </form>
    </Card>
  );
};

const AddTimelineForm = ({ onTimelineAdded }) => {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.warn("Both title and description are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await axiosInstance.post(`/user/lead/${id}/timeLine`, formData);
      if (data.success) {
        toast.success(data.message || "Timeline event added.");
        setFormData({ title: "", description: "" });
        onTimelineAdded?.(); // refresh parent timeline
      } else {
        toast.error(data.message || "Failed to add timeline event.");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Add Timeline Log">
      <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
        <Select
          id="title"
          label="Event Title"
          placeholder="Select Event"
          options={timelineEvents}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Textarea
          id="description"
          label="Description"
          placeholder="Describe this event..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <div className="flex justify-end">
          <SubmitButton isSubmitting={isSubmitting}>Add Event</SubmitButton>
        </div>
      </form>
    </Card>
  );
};

const LeadInfo = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  const getData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(`/user/lead/${id}`);
      if (data.success) {
        setData(data.lead);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  return (
    <>
      <Loading loading={isLoading}>
        {data && (
          <Card className="p-4 bg-gradient-to-b from-[#0c1221] to-[#0f183a] rounded-lg shadow-lg text-white mb-6">
            {/* Top Row: Name and Status */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {data.firstName} {data.lastName}
                </h2>
                <p className="text-sm text-gray-400">Lead Source: {data.leadSource || "N/A"}</p>
              </div>
              <div className="flex gap-2">
                {data.priority && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded text-xs">{data.priority}</span>
                )}
                {data.status && (
                  <span className="bg-[#111C44] text-white px-3 py-1 rounded text-xs">{data.status}</span>
                )}
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Lead Information */}
                <div>
                  <h3 className="text-lg mb-2 text-white">Lead Information</h3>
                  <div className="text-sm grid grid-cols-2 gap-4 items-center bg-[#111C44] p-3 rounded-lg">
                    <div>
                      <span>Email: </span>
                      <span className="text-gray-300">{data.email || "N/A"}</span>
                    </div>
                    <div>
                      <span>Phone: </span>
                      <span className="text-gray-300">{data.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span>Alternate Phone: </span>
                      <span className="text-gray-300">{data.alternatePhone || "N/A"}</span>
                    </div>
                    <div>
                      <span>Branch: </span>
                      <span className="text-gray-300">{data.branch?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span>Territory: </span>
                      <span className="text-gray-300">{data.territory?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span>Project: </span>
                      <span className="text-gray-300">{data.project?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span>Unit Type: </span>
                      <span className="text-gray-300">{data.unitType?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span>Sales Model: </span>
                      <span className="text-gray-300">{data.salesModel?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span>Payment Plan: </span>
                      <span className="text-gray-300">{data.paymentPlan?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span>Assigned To: </span>
                      <span className="text-gray-300">{data.assignedTo?.name || "N/A"}</span>
                    </div>
                    <div>
                      <span>Lead Score: </span>
                      <span className="text-gray-300">{data.leadScore}</span>
                    </div>
                    <div>
                      <span>AI Score (Source): </span>
                      <span className="text-gray-300">{data.aiScoreComponents?.sourceScore}</span>
                    </div>
                    <div>
                      <span>Preferred Channel: </span>
                      <span className="text-gray-300">{data.preferredChannel || "N/A"}</span>
                    </div>
                    <div>
                      <span>Campaign Tag: </span>
                      <span className="text-gray-300">{data.campaignEventTag || "N/A"}</span>
                    </div>
                    <div>
                      <span>Budget Range: </span>
                      <span className="text-gray-300">{data.budgetRange || "N/A"}</span>
                    </div>
                    <div>
                      <span>Timeframe: </span>
                      <span className="text-gray-300">{data.timeframe || "N/A"}</span>
                    </div>
                    <div>
                      <span>Purpose: </span>
                      <span className="text-gray-300">
                        {Array.isArray(data.purpose) ? data.purpose.join(", ") : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span>Occupation: </span>
                      <span className="text-gray-300">{data.occupation || "N/A"}</span>
                    </div>
                    <div>
                      <span>KYC Complete: </span>
                      <span className="text-gray-300">{data.kycComplete ? "Yes" : "No"}</span>
                    </div>
                    <div>
                      <span>Credit Score: </span>
                      <span className="text-gray-300">{data.creditScore}</span>
                    </div>
                    <div>
                      <span>Date of Birth: </span>
                      <span className="text-gray-300">
                        {data.dob ? new Date(data.dob).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span>Anniversary: </span>
                      <span className="text-gray-300">
                        {data.anniversary ? new Date(data.anniversary).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span>Investment Model: </span>
                      <span className="text-gray-300">{data.investmentModel || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg text-white mb-2">Notes</h3>
                  <p className="bg-[#111C44] p-3 rounded-lg text-sm text-gray-300">
                    {data.notes || "No notes available"}
                  </p>
                </div>
              </div>

              {/* Right Column - Timeline (static) */}
              {/* Right Column - Timeline */}
              <div>
                <h3 className="text-lg text-white mb-4">Timeline</h3>
                <div className="relative pl-6">
                  {data.leadTimelines
                    ?.slice() // clone array
                    .reverse() // reverse order
                    .map((event, index) => (
                      <div key={event.id} className="relative mb-4">
                        {/* vertical line */}
                        {index !== data.leadTimelines.length - 1 && (
                          <div className="absolute -left-[15px] top-6 w-[2px] h-full bg-gray-700"></div>
                        )}

                        {/* timeline dot */}
                        <span className="absolute top-[5px] -left-[22px] w-4 h-4 bg-[#D4AF37] rounded-full border-2 border-[#0B1530]"></span>

                        {/* event content */}
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-gray-400 text-sm">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.createdAt).toLocaleString()} by {event.createdBy?.name || "System"}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </Loading>
      <div className="space-y-4">
        <AddTimelineForm onTimelineAdded={getData}/>
        <DealClosureForm />
        <ClientFeedbackForm />
      </div>
    </>
  );
};

export default LeadInfo;
