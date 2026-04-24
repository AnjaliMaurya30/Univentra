import { z } from 'zod';

export const announcementSchema = z
  .object({
    title: z.string().min(4, 'Title is required.'),
    content: z.string().min(16, 'Announcement content is too short.'),
    target_type: z.enum(['campus', 'club', 'event']),
    target_id: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.target_type !== 'campus' && !value.target_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['target_id'],
        message: `Please select a ${value.target_type}.`,
      });
    }
  });
