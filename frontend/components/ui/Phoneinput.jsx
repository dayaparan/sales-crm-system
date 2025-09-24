"use client";

import React from "react";
import PhoneInput from "react-phone-input-2";

const Phoneinput = ({
  name,
  label,
  value,
  onChange,
  error,
  isRequired = false,
  disableDropdown = true,
  placeholder = "eg: +91 22 1234 5678",
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block capitalize text-gray-200 form-label mb-1">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <PhoneInput
        country={"in"}
        value={value}
        onChange={onChange}
        masks={{ ae: ".. ... ...." }}
        disableDropdown={disableDropdown}
        placeholder={placeholder}
        inputStyle={{
          width: "100%",
          height: "38px",
        }}
        inputProps={{
          name,
          required: isRequired,
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
};

export default Phoneinput;
