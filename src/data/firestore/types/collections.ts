export type Collection = RootLevelCollection | AlbumsSubcollection | AlbumItemsSubcollection | SessionsSubcollection | SectionsSubcollection;

export const enum RootLevelCollection {
  USERS = "users",
  ALBUMS = "albums",
  USER_DIRECTORY = "userDirectory",
  SESSIONS = "sessions",
  // Parent-facing projection of a session's album linkage (mirrored by a Cloud
  // Function) so parents resolve their album without reading full sessions.
  SESSION_ALBUMS = "sessionAlbums",
  PROGRAM_AREAS = "programAreas",
  POSTS = "posts",
  GOOGLE_OAUTH2_TOKENS = "googleOAuth2Tokens",
}

export const enum AlbumsSubcollection {
  ALBUM_ITEMS = "albumItems"
}

export const enum AlbumItemsSubcollection {
  REPORTS = "reports"
}

export const enum SessionsSubcollection {
  ATTENDEES = "attendees",
  SECTIONS = "sections",
  BUNKS = "bunks",
  DAYS_OFF_SCHEDULE = "daysOffSchedule",
  NIGHT_SCHEDULES = "nightSchedules",
  FREEPLAYS = "freeplays"
}

export const enum SectionsSubcollection {
  SCHEDULE = "schedule"
}