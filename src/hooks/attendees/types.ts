import { AGE_GROUPS } from "@/types/sessions/sessionTypes";
import z from "zod";

const CreateCamperAttendeeRequestSchema = z.object({
  attendeeId: z.number().min(1),
  role: z.literal("CAMPER"),
  ageGroup: z.enum(AGE_GROUPS),
  bunk: z.number().min(1),
})

const CreateStaffAttendeeRequestSchema = z.object({
  attendeeId: z.number().min(1),
  role: z.literal("STAFF"),
  bunk: z.number().min(1),
  isLeadBunkCounselor: z.boolean()
});

const CreateAdminAttendeeRequestSchema = z.object({
  attendeeId: z.number().min(1),
  role: z.literal("ADMIN")
});

const CreateAttendeeRequestSchema = z.union([CreateCamperAttendeeRequestSchema, CreateStaffAttendeeRequestSchema, CreateAdminAttendeeRequestSchema]);

export const CreateAttendeesRequestSchema = z.object({
  sessionId: z.string().uuid(),
  attendees: z.array(CreateAttendeeRequestSchema),
})

export type CreateCamperAttendeeRequest = z.infer<typeof CreateCamperAttendeeRequestSchema>;
export type CreateStaffAttendeeRequest = z.infer<typeof CreateStaffAttendeeRequestSchema>;
export type CreateAdminAttendeeRequest = z.infer<typeof CreateAdminAttendeeRequestSchema>;
export type CreateAttendeeRequest = z.infer<typeof CreateAttendeeRequestSchema>;
export type CreateAttendeesRequest = z.infer<typeof CreateAttendeesRequestSchema>;