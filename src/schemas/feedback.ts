import { z } from 'zod';

export const feedbackSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  feedback_text: z.string().min(12, 'Please share a bit more detail.'),
});
