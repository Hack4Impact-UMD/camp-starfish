import { functions } from "@/config/firebase";
import { useMutation } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { CreateAttendeesRequest } from "./validators";

export async function createAttendees(req: CreateAttendeesRequest) {
  console.log(req);
  await httpsCallable(functions, "createAttendees")(req);
}

export default function useCreateAttendees() {
  return useMutation({
    mutationFn: async (req: CreateAttendeesRequest) => createAttendees(req)
  })
}