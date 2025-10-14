import React from "react";

const AnimatedLogo = ({
  size = "md",
  className = "",
  variant = "loading", // 'loading', 'celebrate', 'pulse'
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  const getAnimationClass = () => {
    switch (variant) {
      case "loading":
        return "animate-spin-slow";
      case "celebrate":
        return "animate-bounce-gentle";
      case "pulse":
        return "animate-pulse-gentle";
      default:
        return "animate-spin-slow";
    }
  };

  const TruckIcon = () => (
    <svg
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={getAnimationClass()}
    >
      <g stroke="#1F2937" strokeWidth="1.5" fill="none">
        <rect x="1" y="3" width="6" height="9" rx="0.5" />
        <rect x="6" y="4" width="9" height="7" rx="1" />
        <circle cx="3" cy="13" r="2" />
        <circle cx="12" cy="13" r="2" />
        <rect
          x="2.5"
          y="5"
          width="3"
          height="3"
          fill="none"
          stroke="#1F2937"
          strokeWidth="0.8"
          rx="0.25"
        />
        <rect
          x="3"
          y="7"
          width="0.8"
          height="1.5"
          fill="none"
          stroke="#1F2937"
          strokeWidth="0.8"
        />
        <line x1="7" y1="5" x2="7" y2="10" stroke="#1F2937" strokeWidth="0.6" />
        <line x1="9" y1="5" x2="9" y2="10" stroke="#1F2937" strokeWidth="0.6" />
        <line
          x1="11"
          y1="5"
          x2="11"
          y2="10"
          stroke="#1F2937"
          strokeWidth="0.6"
        />
        <line
          x1="13"
          y1="5"
          x2="13"
          y2="10"
          stroke="#1F2937"
          strokeWidth="0.6"
        />
        <rect
          x="0.5"
          y="7"
          width="1"
          height="3"
          fill="none"
          stroke="#1F2937"
          strokeWidth="0.6"
          rx="0.2"
        />
        <circle
          cx="7"
          cy="5"
          r="0.5"
          fill="none"
          stroke="#1F2937"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg ${className}`}
    >
      <TruckIcon />
    </div>
  );
};

export default AnimatedLogo;
