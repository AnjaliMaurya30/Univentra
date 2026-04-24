import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(4, 'Event title is required.'),
  short_description: z.string().min(12, 'Add a short event summary.'),
  description: z.string().min(40, 'Add a fuller event description.'),
  category: z.string().min(2, 'Category is required.'),
  venue: z.string().min(2, 'Venue is required.'),
  mode: z.enum(['offline', 'online', 'hybrid']),
  meeting_link: z.string().url('Provide a valid link.').optional().or(z.literal('')),
  organizer_type: z.enum(['club', 'admin']),
  organizer_id: z.string().min(2, 'Organizer is required.'),
  start_time: z.string().min(1, 'Start date and time are required.'),
  end_time: z.string().min(1, 'End date and time are required.'),
  registration_deadline: z.string().min(1, 'Registration deadline is required.'),
  max_participants: z.coerce.number().min(1, 'Capacity must be at least 1.'),
  xp_reward: z.coerce.number().min(0, 'XP reward cannot be negative.'),
  team_based: z.boolean(),
  certificate_enabled: z.boolean(),
  attendance_qr_enabled: z.boolean(),
});
