import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Textinput from "@/components/ui/Textinput";
import SubmitButton from "@/components/ui/SubmitButton";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { useEffect } from "react";

const schema = yup.object({
    name: yup.string().required("New name is required"),
});

const RenameFileModal = ({ active, handleClose, file }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onSubmit",
        defaultValues: { name: file?.name || "" },
    });

    useEffect(() => {
        if (!active || !file) {
            return;
        }

        setValue("name", file.name);

    }, [active, file]);


    const onSubmit = async ({ name }) => {
        try {
            await axiosInstance.patch(`/files/${file._id}`, { name });
            toast.success("File renamed successfully");
            handleClose(true); // Refresh on close
        } catch (error) {
            toast.error("Rename failed");
        }
    };

    return (
        <Modal
            title="Rename File"
            activeModal={active}
            onClose={() => handleClose(false)}
            themeClass="bg-purple-700"
            centered
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Textinput
                    name="name"
                    label="New File Name"
                    error={errors.name}
                    register={register}
                    placeholder="Enter new name"
                    onChange={(e) => setValue("name", e.target.value)}
                />
                <SubmitButton isSubmitting={isSubmitting}>Rename</SubmitButton>
            </form>
        </Modal>
    );
};

export default RenameFileModal;
