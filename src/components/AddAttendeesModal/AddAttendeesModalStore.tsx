import {
  AgeGroup,
  AttendeeRole,
  CamperAttendee,
  StaffAttendee,
} from "@/types/sessions/sessionTypes";
import { getObjectEntriesWithNumberKeys } from "@/utils/stringUtils";
import { create } from "zustand";

interface AddAttendeesModalStoreState {
  selectedAttendeeIds: number[];
  additionalCamperData: Record<
    number,
    Partial<Pick<CamperAttendee, "ageGroup" | "bunk">>
  >;
  additionalStaffData: Record<
    number,
    Partial<Pick<StaffAttendee, "bunk" | "isLeadBunkCounselor">>
  >;
}

interface AddAttendeesModalStoreActions {
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
  selectedAttendeeIds: [],
  additionalCamperData: {},
  additionalStaffData: {},
  actions: {
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
              [attendeeId]: {},
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

export const useSelectedAttendeeIds = () =>
  useAddAttendeesModalStore((state) => state.selectedAttendeeIds);
export const useAdditionalCamperData = () =>
  useAddAttendeesModalStore((state) => state.additionalCamperData);
export const useadditionalStaffData = () =>
  useAddAttendeesModalStore((state) => state.additionalStaffData);
export const useAddAttendeesModalStoreActions = () =>
  useAddAttendeesModalStore((state) => state.actions);
