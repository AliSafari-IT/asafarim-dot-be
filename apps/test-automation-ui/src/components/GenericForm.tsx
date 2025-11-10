import React from "react";

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "json"
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
  className = ""
}: GenericFormProps<T>) {
  const handleFieldChange = (name: keyof T, value: any) => {
    onChange({ ...formData, [name]: value });
  };

  const renderField = (field: FormFieldDefinition<T>) => {
    const value = formData[field.name];
    if (field.render) {
      return field.render(value, (newValue) =>
        handleFieldChange(field.name, newValue)
      );
    }
    switch (field.type) {
      case "text":
      case "number":
        return (
          <input
            type={field.type}
            className="form-control"
            value={value as string | number}
            onChange={(e) =>
              handleFieldChange(
                field.name,
                field.type === "number"
                  ? Number(e.target.value)
                  : e.target.value
              )
            }
            required={field.required}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            data-testid={`input-${String(field.name)}`}
          />
        );

      case "textarea":
      case "json":
        return (
          <textarea
            className={`form-control ${field.type === "json" ? "json-editor" : ""}`}
            value={value as string}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            data-testid={`textarea-${String(field.name)}`}
          />
        );

      case "select":
        return (
          <select
            className="form-control"
            value={value as string || ""}
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
          <label className="checkbox-container" data-testid={`checkbox-${String(field.name)}`}>
            <input
              type="checkbox"
              className="checkbox-input"
              checked={value as boolean}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            />
            {field.label}
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={onSubmit} className={className} data-testid={"generic-form"}>
      <h4 data-testid={"generic-form-title"}>{title}</h4>
      {fields
        .filter((field) => !field.condition || field.condition(formData))
        .map((field) => (
          <div key={String(field.name)} className="form-group" data-testid={`form-group-${String(field.name)}`}>
            {field.type !== "checkbox" && !field.render && (
              <label className="form-label">
                {field.label} {field.required && "*"}
              </label>
            )}
            {renderField(field)}
          </div>
        ))}
      <div className="form-actions" data-testid={"generic-form-actions"}>
        <button type="submit" className="button button-primary" data-testid={"generic-form-submit"}>
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
