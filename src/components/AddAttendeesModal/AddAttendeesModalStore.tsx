import {
  AGE_GROUPS,
  AgeGroup,
  AttendeeRole,
  CamperAttendee,
  StaffAttendee,
} from "@/types/sessions/sessionTypes";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";
import { create } from "zustand";
import { z } from "zod";

const enum AddAttendeesModalScreens {
  SELECT_ATTENDEES,
  INPUT_CAMPER_DATA,
  INPUT_STAFF_DATA,
  CONFIRMATION,
}

interface AddAttendeesModalStoreState {
  activeStep: AddAttendeesModalScreens;
  selectedAttendeeIds: number[];
  additionalCamperData: Record<
    number,
    Partial<Pick<CamperAttendee, "ageGroup" | "bunk">>
  >;
  additionalStaffData: Record<
    number,
    Partial<Pick<StaffAttendee, "bunk">> & Pick<StaffAttendee, "isLeadBunkCounselor">
  >;
}

export const InputCamperDataFormValidator = z.record(z.number().min(1), z.object({
  ageGroup: z.enum(AGE_GROUPS),
  bunk: z.number().min(1)
}));

export const InputStaffDataFormValidator = z.record(z.number().min(1), z.object({
  bunk: z.number().min(1),
  isLeadBunkCounselor: z.boolean()
}))

interface AddAttendeesModalStoreActions {
  prevStep: () => void;
  nextStep: () => void;
  selectAttendeeId: (attendeeId: number, role: AttendeeRole) => void;
  deselectAttendeeId: (attendeeId: number, role: AttendeeRole) => void;
  setBunk: (attendeeId: number, bunkNum: number) => void;
  setAgeGroup: (attendeeId: number, ageGroup: AgeGroup | undefined) => void;
  setIsLeadBunkCounselor: (
    attendeeId: number,
    isLeadBunkCounselor: boolean,
  ) => void;
}

type AddAttendeesModalStore = AddAttendeesModalStoreState & {
  actions: AddAttendeesModalStoreActions;
};

const useAddAttendeesModalStore = create<AddAttendeesModalStore>((set) => ({
  activeStep: AddAttendeesModalScreens.SELECT_ATTENDEES,
  selectedAttendeeIds: [],
  additionalCamperData: {},
  additionalStaffData: {},
  actions: {
    prevStep: () => set((state) => state.activeStep === AddAttendeesModalScreens.SELECT_ATTENDEES ? ({}) : ({ activeStep: state.activeStep - 1 })),
    nextStep: () => set((state) => state.activeStep === AddAttendeesModalScreens.CONFIRMATION ? ({}) : ({ activeStep: state.activeStep + 1 })),
    selectAttendeeId: (attendeeId, role) => {
      switch (role) {
        case "CAMPER":
          return set((state) => ({
            selectedAttendeeIds: [...state.selectedAttendeeIds, attendeeId],
            additionalCamperData: {
              ...state.additionalCamperData,
              [attendeeId]: {},
            },
          }));
        case "STAFF":
          return set((state) => ({
            selectedAttendeeIds: [...state.selectedAttendeeIds, attendeeId],
            additionalStaffData: {
              ...state.additionalStaffData,
              [attendeeId]: {
                isLeadBunkCounselor: false
              },
            },
          }));
        case "ADMIN":
          return set((state) => ({
            selectedAttendeeIds: [...state.selectedAttendeeIds, attendeeId],
          }));
      }
    },
    deselectAttendeeId: (attendeeId, role) => {
      switch (role) {
        case "CAMPER":
          return set((state) => ({
            selectedAttendeeIds: state.selectedAttendeeIds.filter(
              (a) => a !== attendeeId,
            ),
            additionalCamperData: Object.fromEntries(
              getObjectEntriesWithNumberKeys(state.additionalCamperData).filter(
                ([camperId, _camper]) => camperId !== attendeeId,
              ),
            ),
          }));
        case "STAFF":
          return set((state) => ({
            selectedAttendeeIds: state.selectedAttendeeIds.filter(
              (a) => a !== attendeeId,
            ),
            additionalStaffData: Object.fromEntries(
              getObjectEntriesWithNumberKeys(state.additionalStaffData).filter(
                ([stafferId, _staffer]) => stafferId !== attendeeId,
              ),
            ),
          }));
        case "ADMIN":
          return set((state) => ({
            selectedAttendeeIds: state.selectedAttendeeIds.filter(
              (a) => a !== attendeeId,
            ),
          }));
      }
    },
    setBunk: (attendeeId, bunkNum) =>
      set((state) => {
        if (attendeeId in state.additionalCamperData) {
          return {
            additionalCamperData: {
              ...state.additionalCamperData,
              [attendeeId]: {
                ...state.additionalCamperData[attendeeId],
                bunk: bunkNum,
              },
            },
          };
        } else if (attendeeId in state.additionalStaffData) {
          return {
            additionalStaffData: {
              ...state.additionalStaffData,
              [attendeeId]: {
                ...state.additionalStaffData[attendeeId],
                bunk: bunkNum,
              },
            },
          };
        }
        return {};
      }),
    setAgeGroup: (attendeeId, ageGroup) =>
      set((state) => {
        if (attendeeId in state.additionalCamperData) {
          return {
            additionalCamperData: {
              ...state.additionalCamperData,
              [attendeeId]: {
                ...state.additionalCamperData[attendeeId],
                ageGroup,
              },
            },
          };
        }
        return {};
      }),
    setIsLeadBunkCounselor: (attendeeId, isLeadBunkCounselor) =>
      set((state) => {
        if (attendeeId in state.additionalStaffData) {
          return {
            additionalStaffData: {
              ...state.additionalStaffData,
              [attendeeId]: {
                ...state.additionalStaffData[attendeeId],
                isLeadBunkCounselor,
              },
            },
          };
        }
        return {};
      }),
  },
}));

export const useActiveStep = () => useAddAttendeesModalStore((state) => state.activeStep);
export const useSelectedAttendeeIds = () =>
  useAddAttendeesModalStore((state) => state.selectedAttendeeIds);
export const useAdditionalCamperData = () =>
  useAddAttendeesModalStore((state) => state.additionalCamperData);
export const useAdditionalStaffData = () =>
  useAddAttendeesModalStore((state) => state.additionalStaffData);
export const useAddAttendeesModalStoreActions = () =>
  useAddAttendeesModalStore((state) => state.actions);
