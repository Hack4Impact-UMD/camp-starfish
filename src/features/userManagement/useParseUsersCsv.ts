import useParseFamilyCsv from "./useParseFamilyCsv";
import useParseEmployeeCsv from "./useParseEmployeeCsv";
import { UsersCsvType } from "./useProcessUsersCsv";

export default function useProcessUsersCsv(usersCsvType: UsersCsvType) {
  const parseFamilyCsvMutation = useParseFamilyCsv();
  const parseEmployeeCsvMutation = useParseEmployeeCsv();
  return usersCsvType === "FAMILY" ? parseFamilyCsvMutation : parseEmployeeCsvMutation
}