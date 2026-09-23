// src/components/ui/Input.tsx
"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { C } from "@/lib/theme";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = "", style, ...props },
  ref,
) {
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
      <input
        ref={ref}
        className={`w-full h-11 px-3.5 rounded-xl text-[13.5px] outline-none transition-all ${className}`}
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
      {!error && hint && (
        <p className="mt-1.5 text-[12px]" style={{ color: C.slate }}>
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
