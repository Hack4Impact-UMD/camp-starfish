import { accountManagementCloudFunctions } from "./features/accountManagement";
import { googleOAuth2CloudFunctions } from "./features/googleOAuth2";
import { googleAppsScriptCloudFunctions } from "./features/googleAppsScript";
import { userDirectoryCloudFunctions } from "./features/userDirectory";
import { processCamperCsv, processCounselorCsv } from "./features/userCsvProcessing";
import { createAttendees } from "./features/sessions/attendeeManagement";

module.exports = {
  ...accountManagementCloudFunctions,
  ...googleOAuth2CloudFunctions,
  ...googleAppsScriptCloudFunctions,
  ...userDirectoryCloudFunctions,
  processCamperCsv,
  processCounselorCsv,
  createAttendees
}