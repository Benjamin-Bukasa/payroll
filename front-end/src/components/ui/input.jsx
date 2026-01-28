import React from "react";

const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      value,
      onChange,
      onBlur,
      name,
      error, 
      placeholder,
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={name}
            className="text-xs font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            px-3 py-2 rounded-md border outline-none transition
            ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:ring-2 focus:ring-indigo-200"
            }
          `}
        />

        {/* ERROR MESSAGE */}
        {error && (
          <span className="text-xs text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }
);

export default Input;


// className={`w-full px-3 py-2 rounded-md border border-neutral-300 outline-none ${error?"outline-red-500":""}  ${className}`}

// {error && <p className="text-red-500 text-xs">{error}</p>}