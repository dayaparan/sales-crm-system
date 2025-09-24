import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import SubmitButton from "@/components/ui/SubmitButton";
import Textinput from "@/components/ui/Textinput";
import Fileinput from "@/components/ui/Fileinput"
import Select from "@/components/ui/Select";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";

const schema = yup.object({
  name: yup.string().required("Name is Required"),
  link: yup.string().url().required("Link is Required"),
  category: yup.string().required("Category is Required"), // Added category validation
});

const AddLinkModal = ({ handleClose, active, submitData }) => {
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm({ resolver: yupResolver(schema), mode: "onSubmit" });

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await axiosInstance.get("/category", {
        params: { limit: -1 }, // Fetch all categories
      });
      setCategories(res.data.categories);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (active) {
      fetchCategories(); // Fetch categories when modal is opened
    }
  }, [active]);

  const onSubmit = async (data) => {

    await submitData?.({ ...data });
    reset();
    handleClose();
  };

  return (
    <Modal
      title="Add Link"
      label=""
      labelClass="btn-outline-dark"
      activeModal={active}
      onClose={handleClose}
      themeClass="bg-purple-700"
      centered={true}
      noFade={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          name="category"
          error={errors.category}
          onChange={(e) => setValue("category", e.target.value)}
          register={register}
          label="Category"
          msgTooltip
          placeholder={isLoadingCategories ? "Loading categories..." : "Select Category"}
          options={categories.map((category) => ({
            value: category._id,
            label: category.name,
          }))}
        />

        <Textinput
          name="name"
          error={errors.name}
          onChange={(e) => setValue("name", e.target.value)}
          register={register}
          label="Name"
          msgTooltip
          type="text"
          placeholder="Add Name for Link"
        />
        <Textinput
          name="link"
          error={errors.link}
          onChange={(e) => setValue("link", e.target.value)}
          register={register}
          label="Link"
          msgTooltip
          type="url"
          placeholder="Add Link"
        />

        <SubmitButton isSubmitting={isSubmitting}>Submit</SubmitButton>
      </form>
    </Modal>
  );
};

export default AddLinkModal;

AddLinkModal.propTypes = {
  active: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  submitData: PropTypes.func.isRequired,
};