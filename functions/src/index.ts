import * as accountManagementFunctions from "./features/accountManagement";
import * as googleOAuth2Functions from "./features/googleOAuth2";
import * as googleAppsScriptFunctions from "./features/googleAppsScript";

module.exports = {
  ...accountManagementFunctions,
  ...googleOAuth2Functions,
  ...googleAppsScriptFunctions
}