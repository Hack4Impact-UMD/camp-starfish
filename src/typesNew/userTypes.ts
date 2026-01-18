import { Moment } from "moment";

interface BaseUser {
  id: number;
  uid: string;
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

type Role = "CAMPER" | "PARENT" | "STAFF" | "PHOTOGRAPHER" | "ADMIN";
type Gender = "Male" | "Female" | "Other";
type PhotoPermissions = "PUBLIC" | "PRIVATE";


interface Camper extends BaseUser {
  role: "CAMPER";
  photoPermissions: PhotoPermissions;
  parentIds: number[];
  nonoListIds: number[];
}

interface Parent extends BaseUser {
  role: "PARENT";
  camperIds: number[];
}

interface Photographer extends BaseUser {
  role: "PHOTOGRAPHER";
}