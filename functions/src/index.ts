import * as accountManagementFunctions from "./features/accountManagement";
import * as googleOAuth2Functions from "./features/googleOAuth2";

module.exports = {
  ...accountManagementFunctions,
  ...googleOAuth2Functions
}