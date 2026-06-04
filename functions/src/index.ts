import { accountManagementCloudFunctions } from "./features/accountManagement";
import { googleOAuth2CloudFunctions } from "./features/googleOAuth2";
import { googleAppsScriptCloudFunctions } from "./features/googleAppsScript";
import { albumsCloudFunctions } from "./features/albums";
import { sessionsCloudFunctions } from "./features/sessions";
import { createAlbumItemReportCloudFunction } from "./features/albumItemReporting";
import { userDirectoryCloudFunctions } from "./features/userDirectory";
import { handleFamilyCSVUpload, handleEmployeeCSVUpload } from "./features/userCSVParsing";

module.exports = {
  ...accountManagementCloudFunctions,
  ...googleOAuth2CloudFunctions,
  ...googleAppsScriptCloudFunctions,
  ...albumsCloudFunctions,
  ...sessionsCloudFunctions,
  createAlbumItemReportCloudFunction,
  ...userDirectoryCloudFunctions,
  handleFamilyCSVUpload,
  handleEmployeeCSVUpload
}