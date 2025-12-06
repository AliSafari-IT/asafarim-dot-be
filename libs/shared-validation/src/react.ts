import { useState, useCallback } from "react";
import { z, ZodSchema, ZodError } from "zod";

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormValidationResult<T> {
    errors: ValidationErrors<T>;
    validate: (data: T) => boolean;
    validateField: (field: keyof T, value: unknown) => string | null;
    clearErrors: () => void;
    clearFieldError: (field: keyof T) => void;
    setFieldError: (field: keyof T, message: string) => void;
    hasErrors: boolean;
}

/**
 * React hook for form validation using Zod schemas
 * 
 * @example
 * ```tsx
 * import { useFormValidation } from "@asafarim/shared-validation/react";
 * import { loginSchema } from "@asafarim/shared-validation";
 * 
 * function LoginForm() {
 *   const { errors, validate, validateField, clearFieldError } = useFormValidation(loginSchema);
 *   const [formData, setFormData] = useState({ email: "", password: "" });
 * 
 *   const handleChange = (e) => {
 *     const { name, value } = e.target;
 *     setFormData(prev => ({ ...prev, [name]: value }));
 *     clearFieldError(name);
 *   };
 * 
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     if (validate(formData)) {
 *       // Submit form
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="email" onChange={handleChange} />
 *       {errors.email && <span>{errors.email}</span>}
 *       ...
 *     </form>
 *   );
 * }
 * ```
 */
export function useFormValidation<T extends Record<string, unknown>>(
    schema: ZodSchema<T>
): UseFormValidationResult<T> {
    const [errors, setErrors] = useState<ValidationErrors<T>>({});

    const validate = useCallback(
        (data: T): boolean => {
            const result = schema.safeParse(data);
            if (result.success) {
                setErrors({});
                return true;
            }

            const newErrors: ValidationErrors<T> = {};
            result.error.errors.forEach((err) => {
                const path = err.path[0] as keyof T;
                if (path && !newErrors[path]) {
                    newErrors[path] = err.message;
                }
            });
            setErrors(newErrors);
            return false;
        },
        [schema]
    );

    const validateField = useCallback(
        (field: keyof T, value: unknown): string | null => {
            try {
                // For object schemas, try to get the field schema
                if ("shape" in schema) {
                    const objectSchema = schema as unknown as z.ZodObject<z.ZodRawShape>;
                    const fieldSchema = objectSchema.shape[field as string];
                    if (fieldSchema) {
                        const result = fieldSchema.safeParse(value);
                        if (!result.success) {
                            const message = result.error.errors[0]?.message || "Invalid value";
                            setErrors((prev: ValidationErrors<T>) => ({ ...prev, [field]: message }));
                            return message;
                        }
                    }
                }
                setErrors((prev: ValidationErrors<T>) => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
                return null;
            } catch {
                return null;
            }
        },
        [schema]
    );

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const clearFieldError = useCallback((field: keyof T) => {
        setErrors((prev: ValidationErrors<T>) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const setFieldError = useCallback((field: keyof T, message: string) => {
        setErrors((prev: ValidationErrors<T>) => ({ ...prev, [field]: message }));
    }, []);

    const hasErrors = Object.keys(errors).length > 0;

    return {
        errors,
        validate,
        validateField,
        clearErrors,
        clearFieldError,
        setFieldError,
        hasErrors,
    };
}

/**
 * Safely parse data with a Zod schema and return typed result
 */
export function safeParse<T>(
    schema: ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: ValidationErrors<T> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: ValidationErrors<T> = {};
    result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof T;
        if (path && !errors[path]) {
            errors[path] = err.message;
        }
    });

    return { success: false, errors };
}

/**
 * Format Zod errors into a user-friendly object
 */
export function formatZodErrors<T>(error: ZodError): ValidationErrors<T> {
    const errors: ValidationErrors<T> = {};
    error.errors.forEach((err) => {
        const path = err.path[0] as keyof T;
        if (path && !errors[path]) {
            errors[path] = err.message;
        }
    });
    return errors;
}

// Re-export zod for convenience
export { z, ZodError } from "zod";
export type { ZodSchema } from "zod";
