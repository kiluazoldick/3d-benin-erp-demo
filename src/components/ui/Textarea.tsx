// src/components/ui/Textarea.tsx
"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import { C } from "@/lib/theme";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, className = "", style, ...props }, ref) {
    return (
      <div>
        {label && (
          <label
            className="block text-[12.5px] font-semibold mb-2"
            style={{ color: C.ink }}
          >
            {label}
            {props.required && (
              <span style={{ color: C.danger, marginLeft: 2 }}>*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3.5 py-3 rounded-xl text-[13.5px] outline-none transition-all resize-none ${className}`}
          style={{
            backgroundColor: C.white,
            color: C.ink,
            border: `1px solid ${error ? C.danger : C.border}`,
            ...style,
          }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-[12px]" style={{ color: C.danger }}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

export default Textarea;
