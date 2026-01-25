import { Timestamp } from "firebase/firestore";
import { Gender, PhotoPermissions, Role } from "../domain/userTypes";

interface PublicUserDoc {
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  role: Role;
  gender: Gender;
}

interface PrivateUserDoc {
  email?: string;
  dateOfBirth: Timestamp;
}

interface UserMetadataDoc {
  uid?: string;
  createdAt: Timestamp;
}