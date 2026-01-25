import { Timestamp } from "firebase/firestore";
import { Gender, PhotoPermissions, Role } from "../domain/userTypes";

interface BasePublicUserDoc {
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  role: Role;
  gender: Gender;
}

interface BasePrivateUserDoc {
  email?: string;
  dateOfBirth: Timestamp;
}

interface BaseUserMetadataDoc {
  uid?: string;
  createdAt: Timestamp;
}
interface PublicCamperDoc extends PublicUserDoc {
  role: "CAMPER";
  photoPermissions: PhotoPermissions;
  parentIds: number[];
  nonoListIds: number[];
}

interface ParentDoc extends PublicUserDoc {
  role: "PARENT";
  camperIds: number[];
}

interface PhotographerDoc extends PublicUserDoc {
  role: "PHOTOGRAPHER";
}

interface CounselorDoc extends PublicUserDoc {
  role: "STAFF" | "ADMIN";
  nonoListIds: number[];
  yesyesListIds: number[];
}

interface StaffDoc extends CounselorDoc {
  role: "STAFF";
}

interface AdminDoc extends CounselorDoc {
  role: "ADMIN";
}