import { SchedulingSection, SchedulingSectionID } from "../types/sessionTypes";


export function publishSection<T extends SchedulingSection | SchedulingSectionID>(
  section: T
): T {
  return {
    ...section,
    isPublished: true
  };
}

export function unpublishSection<T extends SchedulingSection | SchedulingSectionID>(
  section: T
): T {
  return {
    ...section,
    isPublished: false
  };
}