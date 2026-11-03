import { accountManagementCloudFunctions } from "./features/accountManagement";
import { googleOAuth2CloudFunctions } from "./features/googleOAuth2";
import { googleAppsScriptCloudFunctions } from "./features/googleAppsScript";
import { personDirectoryCloudFunctions } from "./features/personDirectory";
import { processCamperCsv, processCounselorCsv } from "./features/personCsvProcessing";
import { createAttendees } from "./features/sessions/attendeeManagement";

module.exports = {
  ...accountManagementCloudFunctions,
  ...googleOAuth2CloudFunctions,
  ...googleAppsScriptCloudFunctions,
  ...personDirectoryCloudFunctions,
  processCamperCsv,
  processCounselorCsv,
  createAttendees
}