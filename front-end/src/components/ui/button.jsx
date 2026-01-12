

const Button = ({onClick, type, children, className, buttonStyle, loading, ...props}) => {
  return (
    <>
      <button type={type} onClick={onClick} className={` ${buttonStyle ?"bg-indigo-600 text-white text-center":"bg-neutral-50 text-neutral-900 text-center font-medium"}w-full items-center justify-center gap-3 font-semibold  border  ${className}`}
      disabled={loading}
      {...props}
      >
        {loading?"Chargement...":children}
      </button>
    </>
  );
}

export default Button;
