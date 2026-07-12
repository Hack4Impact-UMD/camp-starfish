import {
  AgeGroup,
  CamperAttendee,
  StaffAttendee,
} from "@/types/sessions/sessionTypes";
import { create } from "zustand";

interface AddAttendeesModalStoreState {
  selectedAttendeeIds: number[];
  additionalCamperData: Record<
    number,
    Pick<CamperAttendee, "ageGroup" | "bunk">
  >;
  additionalStaffData: Record<
    number,
    Pick<StaffAttendee, "bunk" | "isLeadBunkCounselor">
  >;
}

interface AddAttendeesModalStoreActions {
  selectAttendeeId: (attendeeId: number) => void;
  deselectAttendeeId: (attendeeId: number) => void;
  setBunk: (attendeeId: number, bunkNum: number) => void;
  setAgeGroup: (attendeeId: number, ageGroup: AgeGroup) => void;
  setIsBunkCounselor: (
    attendeeId: number,
    isLeadBunkCounselor: boolean,
  ) => void;
}

type AddAttendeesModalStore = AddAttendeesModalStoreState & {
  actions: AddAttendeesModalStoreActions;
};

export const useAddAttendeesModalStore = create<AddAttendeesModalStore>(
  (set) => ({
    selectedAttendeeIds: [],
    additionalCamperData: {},
    additionalStaffData: {},
    actions: {
      selectAttendeeId: (attendeeId: number) =>
        set((state) => ({
          selectedAttendeeIds: [...state.selectedAttendeeIds, attendeeId],
        })),
      deselectAttendeeId: (attendeeId: number) =>
        set((state) => ({
          selectedAttendeeIds: state.selectedAttendeeIds.filter(
            (a) => a !== attendeeId,
          ),
        })),
      setBunk: (attendeeId: number, bunkNum: number) =>
        set((state) => {
          if (attendeeId in state.additionalCamperData) {
            return { additionalCamperData: { ...state.additionalCamperData, [attendeeId]: { ...state.additionalCamperData[attendeeId], bunk: bunkNum } } };
          } else if (attendeeId in state.additionalStaffData) {
            return { additionalStaffData: { ...state.additionalStaffData, [attendeeId]: { ...state.additionalStaffData[attendeeId], bunk: bunkNum } } };
          }
          return {};
        }),
      setAgeGroup: (attendeeId: number, ageGroup: AgeGroup) => set((state) => {
        if (attendeeId in state.additionalCamperData) {
          return { additionalCamperData: { ...state.additionalCamperData, [attendeeId]: { ...state.additionalCamperData[attendeeId], ageGroup } } };
        }
        return {};
      }),
      setIsBunkCounselor: (attendeeId: number, isLeadBunkCounselor: boolean) => set((state) => {
        if (attendeeId in state.additionalStaffData) {
          return { additionalStaffData: { ...state.additionalStaffData, [attendeeId]: { ...state.additionalStaffData[attendeeId], isLeadBunkCounselor } } };
        }
        return {};
      })
    },
  }),
);
