export type Collection = RootLevelCollection | SessionsSubcollection | SectionsSubcollection;

export const enum RootLevelCollection {
  USERS = "users",
  USER_DIRECTORY = "userDirectory",
  SESSIONS = "sessions",
  PROGRAM_AREAS = "programAreas",
  POSTS = "posts",
  GOOGLE_OAUTH2_TOKENS = "googleOAuth2Tokens",
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
  SCHEDULE = "schedule",
  ACTIVITY_PREFERENCES = "activityPreferences"
}