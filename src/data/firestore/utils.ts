export enum Collection {
  CAMPERS = "campers", // id: campminderId
  PARENTS = "parents", // id: campminderId
  PHOTOGRAPHERS = "photographers", // id: campminderId
  STAFF = "staff", // id: campminderId
  ADMINS = "admins", // id: campminderId

  ALBUMS = "albums", // id: uuid
  SESSIONS = "sessions", // id: uuid
  PROGRAM_AREAS = "program_areas", // one doc, id same as collection
  POSTS = "posts", // one doc, id same as collection
}

export enum AlbumsSubcollection {
  IMAGE_METADATAS = "image_metadatas", // id: uuid
}

export enum SessionsSubcollection {
  ATTENDEES = "attendees", // id: campminderId
  SECTIONS = "sections", // id: uuid
  BUNKS = "bunks", // id: bunk number
  NIGHT_SHIFTS = "night_shifts", // id: night shift date
  FREEPLAYS = "freeplays", // id: freeplay date
}

export enum SectionsSubcollection {
  SCHEDULE = "schedule", // id: one doc, id same as collection
}