import { Moment } from "moment";

interface User {
  id: number;
  uid?: string;
  email: string;
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  role: Role;
  gender: Gender;
  dateOfBirth: Moment;
}

export type Role = "CAMPER" | "PARENT" | "STAFF" | "PHOTOGRAPHER" | "ADMIN";
export type Gender = "Male" | "Female" | "Other";

type PhotoPermissions = "PUBLIC" | "PRIVATE";
interface Camper extends User {
  role: "CAMPER";
  photoPermissions: PhotoPermissions;
  parentIds: number[];
  nonoListIds: number[];
}

interface Parent extends User {
  role: "PARENT";
  camperIds: number[];
}

interface Photographer extends User {
  role: "PHOTOGRAPHER";
}

interface Counselor extends User {
  role: "STAFF" | "ADMIN";
  nonoListIds: number[];
  yesyesListIds: number[];
}

interface Staff extends Counselor {
  role: "STAFF"
}

interface Admin extends Counselor {
  role: "ADMIN"
}