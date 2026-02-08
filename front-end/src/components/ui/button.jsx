
const Button = ({
  onClick,
  type,
  children,
  className,
  buttonStyle,
  loading,
  ...props
}) => {
  const baseClasses = buttonStyle
    ? "bg-indigo-600 text-white text-center rounded-lg"
    : "bg-neutral-50 text-neutral-900 text-center font-medium rounded-lg";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} items-center justify-center gap-3 font-semibold border ${className || ""}`}
      disabled={loading}
      {...props}
    >
      {loading ? "Chargement..." : children}
    </button>
  );
};

export default Button;
