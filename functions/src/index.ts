import { accountManagementCloudFunctions } from "./features/accountManagement";
import { googleOAuth2CloudFunctions } from "./features/googleOAuth2";
import { googleAppsScriptCloudFunctions } from "./features/googleAppsScript";

module.exports = {
  ...accountManagementCloudFunctions,
  ...googleOAuth2CloudFunctions,
  ...googleAppsScriptCloudFunctions
}