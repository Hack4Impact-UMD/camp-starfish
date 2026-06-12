import { accountManagementCloudFunctions } from "./features/accountManagement";
import { googleOAuth2CloudFunctions } from "./features/googleOAuth2";
import { googleAppsScriptCloudFunctions } from "./features/googleAppsScript";
import { albumsCloudFunctions } from "./features/albums";
import { createAlbumItemReportCloudFunction } from "./features/albumItemReporting";
import { userDirectoryCloudFunctions } from "./features/userDirectory";
import { processFamilyCsv, processEmployeeCsv } from "./features/userCsvProcessing";
import { HttpsError, onCall } from "firebase-functions/https";
import { createUserDoc } from "./data/firestore/users";
import { AdminDoc } from "@/data/firestore/types/documents";
import moment from "moment";

module.exports = {
  ...accountManagementCloudFunctions,
  ...googleOAuth2CloudFunctions,
  ...googleAppsScriptCloudFunctions,
  ...albumsCloudFunctions,
  createAlbumItemReportCloudFunction,
  ...userDirectoryCloudFunctions,
  processFamilyCsv,
  processEmployeeCsv,
  createInitialSuperAdmin: onCall(async (req) => {
    if (req.auth?.token.email !== "nitin.kanchinadam@gmail.com") {
      throw new HttpsError("permission-denied", "User does not have permission.");
    }
    await createUserDoc(1, {
      dateOfBirth: moment(),
      email: 'lydia@campstarfish.org',
      gender: "Female",
      name: {
        firstName: "Lydia",
        lastName: "Beeler",
      },
      isSuperAdmim: true,
      role: "ADMIN",
      nonoListIds: [],
      yesyesListIds: [],
    } satisfies AdminDoc)
  })
}