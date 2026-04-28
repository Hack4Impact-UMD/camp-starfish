import { accountManagementCloudFunctions } from "./features/accountManagement";
import { googleOAuth2CloudFunctions } from "./features/googleOAuth2";
import { googleAppsScriptCloudFunctions } from "./features/googleAppsScript";
import { albumsCloudFunctions } from "./features/albums";
import { createAlbumItemReportCloudFunction } from "./features/albumItemReporting";

module.exports = {
  ...accountManagementCloudFunctions,
  ...googleOAuth2CloudFunctions,
  ...googleAppsScriptCloudFunctions,
  ...albumsCloudFunctions,
  createAlbumItemReportCloudFunction
}