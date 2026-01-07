import { CommonSectionID, SchedulingSectionID, SectionID } from "./sessionTypes";

export function isCommonSection(section: SectionID): section is CommonSectionID {
  return section.type === "COMMON";
}

export function isSchedulingSection(section: SectionID): section is SchedulingSectionID {
  return section.type !== "COMMON";
}