import React from "react";
import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Textinput from "@/components/ui/Textinput";
import SubmitButton from "@/components/ui/SubmitButton";

const schema = yup.object({
    name: yup.string().required("Folder name is required"),
});

const RenameFolderModal = ({ active, handleClose, currentName, onRename }) => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { name: currentName },
    });

    // Reset name when modal opens
    React.useEffect(() => {
        if (active) {
            setValue("name", currentName);
        }
    }, [active, currentName]);

    const onSubmit = async (data) => {
        await onRename?.(data.name);
        reset();
        handleClose();
    };

    return (
        <Modal
            title="Rename Folder"
            activeModal={active}
            onClose={handleClose}
            themeClass="bg-purple-700"
            centered
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Textinput
                    name="name"
                    error={errors.name}
                    register={register}
                    label="New Folder Name"
                    msgTooltip
                    type="text"
                    placeholder="Enter new folder name"
                />
                <SubmitButton isSubmitting={isSubmitting}>Rename</SubmitButton>
            </form>
        </Modal>
    );
};

RenameFolderModal.propTypes = {
    active: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    currentName: PropTypes.string,
    onRename: PropTypes.func.isRequired,
};

export default RenameFolderModal;
