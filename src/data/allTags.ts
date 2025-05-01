import { Tag } from "@/types/albumTypes";

export const allTags: Tag[] = [
  {
    campminderId: 1,
    name: { firstName: "Sophie", lastName: "Tsai" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 2,
    name: { firstName: "Prakhar", lastName: "Gupta" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 3,
    name: { firstName: "Tarun", lastName: "Kommuri" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 4,
    name: { firstName: "Tony", lastName: "Wu" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 5,
    name: { firstName: "Hita", lastName: "Thota" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 6,
    name: { firstName: "Esther", lastName: "Yu" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 7,
    name: { firstName: "Brandon", lastName: "Newman" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 8,
    name: { firstName: "Richard", lastName: "Mukam" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 9,
    name: { firstName: "Krishnan", lastName: "Tholkappian" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 10,
    name: { firstName: "Aastha", lastName: "Gautam" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 11,
    name: { firstName: "Nitin", lastName: "Kanchinadam" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 12,
    name: { firstName: "", lastName: "" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 13,
    name: { firstName: "", lastName: "" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 14,
    name: { firstName: "", lastName: "" },
    photoPermissions: "INTERNAL",
  },
  {
    campminderId: 15,
    name: { firstName: "", lastName: "" },
    photoPermissions: "INTERNAL",
  },
];

export function getTags(ids: number[]): Tag[] {
  return allTags.filter((tag: Tag) => ids.includes(tag.campminderId));
}