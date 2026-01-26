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

interface BaseInternalUserDoc {}

interface BaseUserMetadataDoc {
  uid?: string;
  createdAt: Timestamp;
}

interface PublicCamperDoc extends BasePublicUserDoc {
  role: "CAMPER";
  photoPermissions: PhotoPermissions;
  parentIds: number[];
  nonoListIds: number[];
}

interface PrivateCamperDoc extends BasePrivateUserDoc {
  parentIds: number[];
  photoPermissions: PhotoPermissions;
}

interface InternalCamperDoc extends BaseInternalUserDoc {
  nonoListIds: number[];
}

interface MetadataCamperDoc extends BaseUserMetadataDoc {}



interface PublicParentDoc extends BasePublicUserDoc {
  role: "PARENT";
  camperIds: number[];
}

interface PhotographerDoc extends BasePublicUserDoc {
  role: "PHOTOGRAPHER";
}

interface CounselorDoc extends BasePublicUserDoc {
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