"use client";

import React from "react";
import { useToaster } from 'react-hot-toast/headless';


export type ToastVariant = "success" | "error";

/* TODO:
include image on left side */
export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  onClose?: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success:
    "text-green-600",
  error:
    "text-red-700",
};

export function Toast({ id, title, message, variant = "success", onClose }: ToastProps) {
  return (
    <div
      className={`border px-4 py-3 rounded ${variantStyles[variant]}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title ? (
            <p className="font-bold">{title}</p>
          ) : null}
          <p className="text-sm text-gray-800">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={() => onClose(id)}
            className="ml-2 rounded p-1 text-current/70"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default Toast;
