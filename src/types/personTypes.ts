export interface Person {
  firstName: string;
  middleName?: string;
  lastName: string;
  
}

export interface Camper extends Person {
  dateOfBirth: string; // ISO-8601
  guardians: Parent[];
}

export interface Parent extends Person {
  
}

export interface Staff extends Person {

}

// Permissions for sharing photos with a given child in them
// public: photo can be used online in promotional materials
// semi-private: photo can not be used publicly, but other Camp Starfish parents can see it if their child is also in the photo
// private: only the child's parents can see the photo
export type PhotoPermissions = 'public' | 'semi-private' | 'private'