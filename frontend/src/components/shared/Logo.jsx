import React from "react";

const Logo = ({
  variant = "default", // 'default', 'icon', 'monochrome', 'text'
  size = "md", // 'sm', 'md', 'lg', 'xl'
  className = "",
  showText = true,
  textColor = "currentColor",
  animated = true, // New prop for animations
}) => {
  const sizeClasses = {
    sm: { icon: "w-6 h-6", text: "text-sm", tagline: "text-xs" },
    md: { icon: "w-8 h-8", text: "text-lg", tagline: "text-xs" },
    lg: { icon: "w-10 h-10", text: "text-xl", tagline: "text-sm" },
    xl: { icon: "w-12 h-12", text: "text-2xl", tagline: "text-base" },
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  const iconColor = variant === "monochrome" ? "currentColor" : "#2563EB";
  const textColorClass =
    variant === "monochrome" ? "text-current" : "text-gray-900 dark:text-white";
  const taglineColorClass =
    variant === "monochrome"
      ? "text-current opacity-70"
      : "text-gray-500 dark:text-gray-400";

  // Modern abstract icon representing global connection and movement
  const ModernIcon = () => (
    <svg
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={
        animated
          ? "transition-all duration-300 ease-in-out animate-spin-slow"
          : ""
      }
    >
      <defs>
        <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* Global connection network */}
      <g stroke="white" strokeWidth="2" fill="none">
        {/* Central hub */}
        <circle cx="16" cy="16" r="3" fill="white" />

        {/* Connection lines */}
        <path
          d="M16 3C16 3 8 8 8 16C8 20 12 24 16 24C20 24 24 20 24 16C24 8 16 3 16 3Z"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path
          d="M16 3C16 3 24 8 24 16C24 20 20 24 16 24C12 24 8 20 8 16C8 8 16 3 16 3Z"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Movement indicators */}
        <circle cx="8" cy="8" r="1.5" fill="white" opacity="0.9" />
        <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.9" />
        <circle cx="8" cy="24" r="1.5" fill="white" opacity="0.9" />
        <circle cx="24" cy="24" r="1.5" fill="white" opacity="0.9" />

        {/* Flow lines */}
        <path d="M6 6L10 10" strokeWidth="1" opacity="0.4" />
        <path d="M26 6L22 10" strokeWidth="1" opacity="0.4" />
        <path d="M6 26L10 22" strokeWidth="1" opacity="0.4" />
        <path d="M26 26L22 22" strokeWidth="1" opacity="0.4" />
      </g>
    </svg>
  );

  const iconContainerClasses = animated
    ? `${sizeClasses[size].icon} bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-105`
    : `${sizeClasses[size].icon} bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg`;

  if (variant === "icon") {
    return (
      <div className={`${iconContainerClasses} ${className}`}>
        <ModernIcon />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={`flex flex-col ${className}`}>
        <span
          className={`${
            sizeClasses[size].text
          } font-bold ${textColorClass} leading-tight ${
            animated
              ? "transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400"
              : ""
          }`}
        >
          RoamEase
        </span>
        <span
          className={`${
            sizeClasses[size].tagline
          } font-medium leading-tight ${taglineColorClass} ${
            animated ? "transition-all duration-300 hover:opacity-100" : ""
          }`}
        >
          LOGISTICS
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={iconContainerClasses}>
        <ModernIcon />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${
              sizeClasses[size].text
            } font-bold ${textColorClass} leading-tight ${
              animated
                ? "transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400"
                : ""
            }`}
          >
            RoamEase
          </span>
          <span
            className={`${
              sizeClasses[size].tagline
            } font-medium leading-tight ${taglineColorClass} ${
              animated ? "transition-all duration-300 hover:opacity-100" : ""
            }`}
          >
            LOGISTICS
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
