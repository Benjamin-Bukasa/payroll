import React from "react"

const STATUS_CONFIG = {
  ACTIF: {
    label: "Actif",
    bg: "bg-green-100",
    text: "text-green-600",
    dot: "bg-green-500",
  },
  INACTIF: {
    label: "Inactif",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  SUSPENDU: {
    label: "Suspendu",
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    dot: "bg-yellow-500",
  },
}

const Badge = ({
  status = "INACTIF",
  className = "",
}) => {
  const config =
    STATUS_CONFIG[status] || {
      label: status,
      bg: "bg-gray-100",
      text: "text-gray-500",
      dot: "bg-gray-400",
    }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full
        px-2 py-0.5
        text-xs font-normal
        leading-none
        ${config.bg} ${config.text}
        ${className}
      `}
    >
      {/* Dot */}
      <span
        className={`
          h-1.5 w-1.5
          rounded-full
          ${config.dot}
        `}
      />

      {/* Label */}
      <span className="whitespace-nowrap">
        {config.label}
      </span>
    </span>
  )
}

export default Badge
