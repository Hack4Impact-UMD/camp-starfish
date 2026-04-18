export type Collection = RootLevelCollection | AlbumsSubcollection | SessionsSubcollection | SectionsSubcollection;

export const enum RootLevelCollection {
  USERS = "users",
  ALBUMS = "albums",
  SESSIONS = "sessions",
  PROGRAM_AREAS = "programAreas",
  POSTS = "posts",
  GOOGLE_OAUTH2_TOKENS = "googleOAuth2Tokens",
}

export const enum AlbumsSubcollection {
  ALBUM_ITEMS = "albumItems"
}

export const enum SessionsSubcollection {
  ATTENDEES = "attendees",
  SECTIONS = "sections",
  BUNKS = "bunks",
  NIGHT_SCHEDULES = "nightSchedules",
  FREEPLAYS = "freeplays"
}

export const enum SectionsSubcollection {
  SCHEDULE = "schedule"
}