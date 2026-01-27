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
interface BaseInternalUserDoc { }
interface BaseUserMetadataDoc {
  uid?: string;
  createdAt: Timestamp;
}

export interface PublicCamperDoc extends BasePublicUserDoc {
  role: "CAMPER";
  photoPermissions: PhotoPermissions;
  parentIds: number[];
  nonoListIds: number[];
}
export interface PrivateCamperDoc extends BasePrivateUserDoc {
  parentIds: number[];
  photoPermissions: PhotoPermissions;
}
export interface InternalCamperDoc extends BaseInternalUserDoc {
  nonoListIds: number[];
}
export interface MetadataCamperDoc extends BaseUserMetadataDoc { }

export interface PublicParentDoc extends BasePublicUserDoc {
  role: "PARENT";
}
export interface PrivateParentDoc extends BasePrivateUserDoc {
  camperIds: number[];
}
export interface InternalParentDoc extends BaseInternalUserDoc { }
export interface MetadataParentDoc extends BaseUserMetadataDoc { }

export interface PublicPhotographerDoc extends BasePublicUserDoc {
  role: "PHOTOGRAPHER";
}
export interface PrivatePhotographerDoc extends BasePrivateUserDoc { }
export interface InternalPhotographerDoc extends BaseInternalUserDoc { }
export interface MetadataPhotographerDoc extends BaseUserMetadataDoc { }

export interface PublicStaffDoc extends BasePublicUserDoc {
  role: "STAFF";
}
export interface PrivateStaffDoc extends BasePrivateUserDoc { };
export interface InternalStaffDoc extends BaseInternalUserDoc {
  nonoListIds: number[];
  yesyesListIds: number[];
};
export interface MetadataStaffDoc extends BaseUserMetadataDoc { };

export interface AdminDoc extends BasePublicUserDoc {
  role: "ADMIN";
}
export interface PrivateAdminDoc extends BasePrivateUserDoc { };
export interface InternalAdminDoc extends BaseInternalUserDoc {
  nonoListIds: number[];
  yesyesListIds: number[];
};
export interface MetadataAdminDoc extends BaseUserMetadataDoc { };