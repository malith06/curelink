const { z } = require("zod");

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot be more than 100 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Please provide a valid email")
      .toLowerCase(),
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(5, "Please provide a valid phone number"),
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email")
    .toLowerCase(),
  password: z.string({ required_error: "Password is required" }),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email")
    .toLowerCase(),
});

const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string({ required_error: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
