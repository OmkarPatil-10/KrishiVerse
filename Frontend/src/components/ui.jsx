import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import PropTypes from 'prop-types';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Button Component
export const Button = ({ className, variant = "primary", size = "md", ...props }) => {
    const variants = {
        primary: "bg-primary text-white hover:bg-green-800",
        secondary: "bg-white text-primary border border-primary hover:bg-green-50",
        danger: "bg-red-600 text-white hover:bg-red-700",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            className={cn("rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], sizes[size], className)}
            {...props}
        />
    );
};
Button.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.string,
    size: PropTypes.string,
};

// Input Component
export const Input = ({ className, label, error, ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input
                className={cn("w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow", error && "border-red-500 focus:ring-red-500", className)}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
Input.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
};

// Card Component
export const Card = ({ className, children, ...props }) => {
    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 p-6", className)} {...props}>
            {children}
        </div>
    );
};
Card.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

// Loader Component
export const Loader = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
}

// Validation Error Message
export const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{message}</span>
        </div>
    )
}
ErrorMessage.propTypes = {
    message: PropTypes.string,
};
