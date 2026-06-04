import useProcessFamilyCSV from "./useProcessFamilyCSV";
import useProcessEmployeeCSV from "./useProcessEmployeeCSV";

export type UsersCsvType = "FAMILY" | "EMPLOYEE";
export const usersCsvTypes: UsersCsvType[] = ["FAMILY", "EMPLOYEE"];

export default function useProcessUsersCsv(usersCsvType: UsersCsvType) {
  const processFamilyCSVMutation = useProcessFamilyCSV();
  const processEmployeeCSVMutation = useProcessEmployeeCSV();
  return usersCsvType === "FAMILY" ? processFamilyCSVMutation : processEmployeeCSVMutation
}