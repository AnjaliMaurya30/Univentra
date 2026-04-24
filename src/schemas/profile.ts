import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required.'),
  department: z.string().min(2, 'Department is required.'),
  year_of_study: z.string().min(2, 'Year of study is required.'),
  bio: z.string().min(12, 'Add a short profile bio.'),
  favorite_category: z.string().min(2, 'Pick a favorite category.'),
  interests: z.string().min(2, 'Add at least one interest.'),
});
