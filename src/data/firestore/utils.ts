export enum Collection {
  CAMPERS = "campers", // id: campminderId
  PARENTS = "parents", // id: campminderId
  EMPLOYEES = "employees", // id: campminderId

  ALBUMS = "albums", // id: uuid
  SESSIONS = "sessions", // id: uuid
  PROGRAM_AREAS = "program_areas", // one doc, id same as collection
  POSTS = "posts", // one doc, id same as collection
}

export enum AlbumsSubcollection {
  IMAGES = "images", // id: uuid
}

export enum SessionsSubcollection {
  ATTENDEES = "attendees", // id: campminderId
  MASTER_SCHEDULES = "master_schedules", // one doc, id same as collection
  BUNKS = "bunks", // id: bunk number
}

export enum MasterSchedulesSubcollection {
  SECTIONS = "sections", // id: uuid
  BUNDLES = "bundles", // id: bundle number
  JAMBOREES = "jamborees", // id: jamboree number
  FREEPLAYS = "freeplays", // id: freeplay date
}