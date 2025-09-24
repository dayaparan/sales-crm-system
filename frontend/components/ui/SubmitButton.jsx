const SubmitButton = ({
  isSubmitting,
  type = "submit",
  className = "btn btn-primary disabled:opacity-75 disabled:cursor-not-allowed",
  children,
  ...rest
}) => {
  return (
    <button className={className} type={type} disabled={isSubmitting} {...rest}>
      {isSubmitting ? <div className="button-loader"></div> : <span>{children || "Submit"}</span>}
    </button>
  );
};

export default SubmitButton;
