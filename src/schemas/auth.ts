import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Your full name is required.'),
    email: z.string().email('Enter a valid email address.'),
    department: z.string().trim().min(2, 'Department is required.'),
    yearOfStudy: z.string().trim().min(1, 'Year of study is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter the email linked to your account.'),
});
