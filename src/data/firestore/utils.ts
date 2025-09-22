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
  SECTIONS = "sections", // id: uuid
  BUNKS = "bunks", // id: bunk number
  NIGHT_SHIFTS = "night_shifts", // id: night shift date
}

export enum SectionsSubcollection {
  BUNDLES = "bundles", // id: bundle number
  JAMBOREES = "jamborees", // id: jamboree number
  FREEPLAYS = "freeplays", // id: freeplay date
}