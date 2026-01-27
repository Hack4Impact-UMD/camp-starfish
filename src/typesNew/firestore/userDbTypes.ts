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
}
interface PrivateParentDoc extends BasePrivateUserDoc {
  camperIds: number[];
}
interface InternalParentDoc extends BaseInternalUserDoc {}
interface MetadataParentDoc extends BaseUserMetadataDoc {}

interface PublicPhotographerDoc extends BasePublicUserDoc {
  role: "PHOTOGRAPHER";
}
interface PrivatePhotographerDoc extends BasePrivateUserDoc {}
interface InternalPhotographerDoc extends BaseInternalUserDoc {}
interface MetadataPhotographerDoc extends BaseUserMetadataDoc {}

interface PublicStaffDoc extends BasePublicUserDoc {
  role: "STAFF";
}
type PrivateStaffDoc = BasePrivateUserDoc;
interface InternalStaffDoc extends BaseInternalUserDoc {
  nonoListIds: number[];
  yesyesListIds: number[];
};
type MetadataStaffDoc = BaseUserMetadataDoc;

interface AdminDoc extends BasePublicUserDoc {
  role: "ADMIN";
}
type PrivateAdminDoc = BasePrivateUserDoc;
interface InternalAdminDoc extends BaseInternalUserDoc {
  nonoListIds: number[];
  yesyesListIds: number[];
};
type MetadataAdminDoc = BaseUserMetadataDoc;