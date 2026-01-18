import { Moment } from "moment";

interface BaseUser {
  id: string;
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  role: Role;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Moment;
  
}

type Role = "CAMPER" | "PARENT" | "STAFF" | "PHOTOGRAPHER" | "ADMIN";
type Gender = "Male" | "Female" | "Other";
