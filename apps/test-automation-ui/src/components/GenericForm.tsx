// apps/test-automation-ui/src/components/GenericForm.tsx
import React, { useEffect, useRef } from "react";
import styled from "@emotion/styled";

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background-paper);
`;

const FormGroupHeader = styled.h5`
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "json"
  | "date"
  | "datetime"
  | "datetime-local"
  | "time"
  | "file"
  | "color"
  | "password"
  | "radio"
  | "range"
  | "custom";

export interface FormFieldDefinition<T> {
  name: keyof T;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  group?: string;
  readonly?: boolean;
  render?: (value: any, onChange: (value: any) => void) => React.ReactNode;
  condition?: (formData: T) => boolean;
}

interface GenericFormProps<T> {
  fields: FormFieldDefinition<T>[];
  formData: T;
  onChange: (data: T) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  title: string;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
  autoFocusFieldName?: keyof T;
}

export function GenericForm<T>({
  fields,
  formData,
  onChange,
  onSubmit,
  onCancel,
  title,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  className = "",
  autoFocusFieldName,
}: GenericFormProps<T>) {
  const handleFieldChange = (name: keyof T, value: any) => {
    onChange({ ...formData, [name]: value });
  };
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (autoFocusFieldName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocusFieldName]);

  const renderField = (field: FormFieldDefinition<T>) => {
    const value = formData[field.name];
    if (field.render) {
      return field.render(value, (newValue) =>
        handleFieldChange(field.name, newValue)
      );
    }

    // Common input props
    const commonInputProps = {
      className: "form-control",
      value: value as string | number | string[] | undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue =
          field.type === "number" ? Number(e.target.value) : e.target.value;
        handleFieldChange(field.name, newValue);
      },
      required: field.required,
      placeholder: field.placeholder,
      min: field.min,
      max: field.max,
      readOnly: field.readonly,
      "data-testid": `input-${String(field.name)}`,
    } as React.InputHTMLAttributes<HTMLInputElement>;

    switch (field.type) {
      case "text":
      case "number":
      case "password":
      case "email":
      case "tel":
      case "url":
      case "date":
      case "datetime-local":
      case "time":
      case "color":
      case "range":
        return (
          <input
            type={field.type}
            {...commonInputProps}
            ref={field.name === autoFocusFieldName ? inputRef : undefined}
          />
        );

      case "textarea":
      case "json":
        return (
          <textarea
            className={`form-control ${
              field.type === "json" ? "json-editor" : ""
            }`}
            value={(value as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            readOnly={field.readonly}
            data-testid={`textarea-${String(field.name)}`}
          />
        );

      case "select":
        return (
          <select
            className="form-control"
            value={(value as string) || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            data-testid={`select-${String(field.name)}`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label
            className="checkbox-container"
            data-testid={`checkbox-${String(field.name)}`}
          >
            <input
              type="checkbox"
              className="checkbox-input"
              checked={value as boolean}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            />
            {field.label}
          </label>
        );

      case "radio":
        return (
          <div className="radio-group">
            {field.options?.map((option) => (
              <label key={option.value} className="radio-container">
                <input
                  type="radio"
                  name={String(field.name)}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleFieldChange(field.name, option.value)}
                  className="radio-input"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case "file":
        return (
          <input
            type="file"
            className="form-control"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFieldChange(field.name, file);
            }}
            data-testid={`file-${String(field.name)}`}
          />
        );

      default:
        return null;
    }
  };

  // Group fields by their group property
  const groupedFields = fields
    .filter((field) => !field.condition || field.condition(formData))
    .reduce((groups, field) => {
      const groupName = field.group || "Other";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(field);
      return groups;
    }, {} as Record<string, FormFieldDefinition<T>[]>);

  return (
    <form
      onSubmit={onSubmit}
      className={className}
      data-testid={"generic-form"}
    >
      <h4 data-testid={"generic-form-title"}>{title}</h4>

      {Object.entries(groupedFields).map(([groupName, groupFields]) => (
        <FormGroup
          key={groupName}
          data-testid={`form-group-${groupName
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          {groupName !== "Other" && (
            <FormGroupHeader>{groupName}</FormGroupHeader>
          )}
          {groupFields.map((field) => (
            <div
              key={String(field.name)}
              className="form-field"
              data-testid={`form-field-${String(field.name)}`}
            >
              {field.type !== "checkbox" && !field.render && (
                <label className="form-label">
                  {field.label} {field.required && "*"}
                </label>
              )}
              {renderField(field)}
            </div>
          ))}
        </FormGroup>
      ))}

      <div className="form-actions" data-testid={"generic-form-actions"}>
        <button
          type="submit"
          className="button button-primary"
          data-testid={"generic-form-submit"}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
          data-testid={"generic-form-cancel"}
        >
          {cancelLabel}
        </button>
      </div>
    </form>
  );
}
