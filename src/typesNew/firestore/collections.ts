export const enum Collection {
  USERS = "users",
  ALBUMS = "albums",
  SESSIONS = "sessions",
  PROGRAM_AREAS = "program_areas",
  POSTS = "posts"
}

export const enum UsersSubcollection {
  ADMIN_ONLY = "admin_only",
  PARENT_ONLY = "parent_only"
}

export const enum AlbumsSubcollection {
  IMAGES = "images"
}

export const enum ImagesSubcollection {
  METADATA = "metadata"
}

export const enum SessionsSubcollection {
  ATTENDEES = "attendees",
  SECTIONS = "sections",
  BUNKS = "bunks",
  NIGHT_SCHEDULES = "night_schedules",
  FREEPLAYS = "freeplays"
}

export const enum SectionsSubcollection {
  SCHEDULE = "schedule"
}