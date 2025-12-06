# @asafarim/shared-validation

Shared validation schemas for ASafariM applications using [Zod](https://zod.dev/).

## Installation

```bash
pnpm add @asafarim/shared-validation
```

## Usage

### Auth Schemas (Identity Portal)

```typescript
import { 
  loginSchema, 
  registerSchema, 
  passwordSetupSchema,
  getPasswordStrength 
} from "@asafarim/shared-validation";

// Validate login form
const result = loginSchema.safeParse({
  email: "user@example.com",
  password: "mypassword",
  rememberMe: true
});

if (!result.success) {
  console.log(result.error.errors);
}

// Check password strength
const { score, feedback } = getPasswordStrength("MyP@ss123");
// score: 5 (all requirements met)
// feedback: [] (no missing requirements)
```

### React Hook

```tsx
import { useFormValidation, loginSchema } from "@asafarim/shared-validation";

function LoginForm() {
  const { errors, validate, clearFieldError } = useFormValidation(loginSchema);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(formData)) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" onChange={handleChange} />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <input name="password" type="password" onChange={handleChange} />
      {errors.password && <span className="error">{errors.password}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

## Available Schemas

### Auth Schemas

- `loginSchema` - Email, password, rememberMe
- `registerSchema` - Email, firstName, lastName, password, confirmPassword
- `passwordSetupSchema` - Password with strength requirements, confirmPassword
- `changePasswordSchema` - Current password, new password, confirm
- `forgotPasswordSchema` - Email only
- `resetPasswordSchema` - Token, new password, confirm

### Project Schemas

- `createProjectSchema` - Title, slug, description, status, visibility, etc.
- `updateProjectSchema` - Same as create + id

### Post Schemas

- `createPostSchema` - Title, slug, content, summary, tags, etc.
- `updatePostSchema` - Same as create + id

### Preference Schemas

- `userPreferenceSchema` - Theme, geo, notifications, privacy, accessibility

### Common Utilities

- `idSchema` - UUID validation
- `slugSchema` - URL-safe slug
- `emailSchema` - Email validation
- `urlSchema` - URL validation
- `paginationSchema` - Page, pageSize

## Password Strength Helper

```typescript
import { getPasswordStrength } from "@asafarim/shared-validation";

const { score, feedback } = getPasswordStrength("weak");
// score: 1
// feedback: ["At least 8 characters", "At least one uppercase letter", ...]
```

## Setup

After adding to your project:

```bash
cd libs/shared-validation
pnpm install
pnpm build
```

## License

MIT
