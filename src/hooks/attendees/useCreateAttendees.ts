import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { AdminAttendee, CamperAttendee, StaffAttendee } from "@/types/sessions/sessionTypes";
import { httpsCallable } from "firebase/functions";

export type CreateCamperAttendeeRequest = Pick<CamperAttendee, "attendeeId" | "role" | "ageGroup" | "bunk">;
export type CreateStaffAttendeeRequest = Pick<StaffAttendee, "attendeeId" | "role" | "bunk" | "isLeadBunkCounselor">;
export type CreateAdminAttendeeRequest = Pick<AdminAttendee, "attendeeId" | "role">;

export type CreateAttendeeRequest =
  | CreateCamperAttendeeRequest
  | CreateStaffAttendeeRequest
  | CreateAdminAttendeeRequest;

export interface CreateAttendeesRequest {
  sessionId: string;
  attendees: CreateAttendeeRequest[];
}

export async function createAttendees(req: CreateAttendeesRequest) {
  await httpsCallable(functions, "createAttendees")(req);
}

export default function useCreateAttendees() {
  return useMutation({
    mutationFn: async (req: CreateAttendeesRequest) => createAttendees(req)
  })
}