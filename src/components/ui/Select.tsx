// src/components/ui/Select.tsx
"use client";

import { SelectHTMLAttributes, forwardRef } from "react";
import { C } from "@/lib/theme";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className = "", style, ...props },
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
      <select
        ref={ref}
        className={`w-full h-11 px-3.5 rounded-xl text-[13.5px] outline-none transition-all ${className}`}
        style={{
          backgroundColor: C.white,
          color: C.ink,
          border: `1px solid ${error ? C.danger : C.border}`,
          ...style,
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-[12px]" style={{ color: C.danger }}>
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
