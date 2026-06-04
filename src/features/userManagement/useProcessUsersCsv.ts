import useProcessFamilyCSV from "./useProcessFamilyCSV";
import useProcessEmployeeCSV from "./useProcessEmployeeCSV";
import { UsersCsvType } from "./types";

export default function useProcessUsersCsv(usersCsvType: UsersCsvType) {
  const processFamilyCSVMutation = useProcessFamilyCSV();
  const processEmployeeCSVMutation = useProcessEmployeeCSV();
  return usersCsvType === "FAMILY" ? processFamilyCSVMutation : processEmployeeCSVMutation
}