/**
 * Integration Test Runner for checkWhitelist Cloud Function
 * 
 * This runs integration tests against Firebase emulators.
 * 
 * To run:
 * 1. Start emulators: firebase emulators:start --only auth,firestore,functions
 * 2. In another terminal: npm run test:integration
 */

import * as admin from "firebase-admin";
import functionsTest from "firebase-functions-test";
import { Collection } from "../data/firestore/utils";

// Set environment variables to point to Firebase emulators
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199";

// Initialize firebase-functions-test (this automatically initializes Firebase Admin for emulators)
const test = functionsTest({
  projectId: "camp-starfish",
  // No credential needed for emulators - functionsTest handles this automatically
});

// Import the function after test initialization
const { checkWhitelist } = require("./accountManagement").accountManagementCloudFunctions;

const wrappedFunction = test.wrap(checkWhitelist);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: Array<{ name: string; error: string }> = [];

function logResult(testName: string, passed: boolean, error?: string) {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.log(`❌ FAIL: ${testName}`);
    if (error) {
      console.log(`   Error: ${error}`);
      failures.push({ name: testName, error: error });
    }
  }
}

async function cleanupUsers() {
  try {
    const users = await admin.auth().listUsers();
    for (const user of users.users) {
      try {
        await admin.auth().deleteUser(user.uid);
      } catch (error) {
        // Ignore individual delete errors
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

async function runTest(name: string, testFn: () => Promise<void>) {
  try {
    await cleanupUsers();
    await testFn();
    logResult(name, true);
  } catch (error: any) {
    logResult(name, false, error.message);
  }
}

async function testUnauthenticatedUser() {
  const request = { auth: undefined, data: {} };
  let threwError = false;
  
  try {
    await wrappedFunction(request);
  } catch (error: any) {
    threwError = true;
    if (error.code !== "failed-precondition" || !error.message.includes("Unauthenticated")) {
      throw new Error(`Wrong error: ${error.code} - ${error.message}`);
    }
  }
  
  if (!threwError) {
    throw new Error("Expected error but got success");
  }
}

async function testMissingUid() {
  const request = { auth: {}, data: {} };
  let threwError = false;
  
  try {
    await wrappedFunction(request);
  } catch (error: any) {
    threwError = true;
    if (error.code !== "failed-precondition" || !error.message.includes("Unauthenticated")) {
      throw new Error(`Wrong error: ${error.code} - ${error.message}`);
    }
  }
  
  if (!threwError) {
    throw new Error("Expected error but got success");
  }
}

async function testUserWithoutEmail() {
  const user = await admin.auth().createUser({ uid: "test-no-email" });
  const request = { auth: { uid: user.uid }, data: {} };
  
  try {
    await wrappedFunction(request);
    throw new Error("Expected error but got success");
  } catch (error: any) {
    if (error.code !== "failed-precondition" || !error.message.includes("User has no email address")) {
      throw new Error(`Wrong error: ${error.code} - ${error.message}`);
    }
  }
  
  // Verify user was deleted
  try {
    await admin.auth().getUser(user.uid);
    throw new Error("User should have been deleted");
  } catch (error: any) {
    if (error.code !== "auth/user-not-found") {
      throw new Error(`Expected user-not-found but got: ${error.code}`);
    }
  }
}

async function testSuccessfulParentAssignment() {
  const email = "parent@test.com";
  const campminderId = 12345;
  
  const user = await admin.auth().createUser({ 
    uid: "test-parent-uid",
    email 
  });
  
  await admin.firestore()
    .collection(Collection.PARENTS)
    .doc(String(campminderId))
    .set({ email });
  
  const request = { auth: { uid: user.uid }, data: {} };
  const result = await wrappedFunction(request);
  
  if (result.role !== "PARENT" || result.campminderId !== campminderId) {
    throw new Error(`Wrong result: ${JSON.stringify(result)}`);
  }
  
  // Verify custom claims
  const updatedUser = await admin.auth().getUser(user.uid);
  if (updatedUser.customClaims?.role !== "PARENT" || updatedUser.customClaims?.campminderId !== campminderId) {
    throw new Error("Custom claims not set correctly");
  }
}

async function testSuccessfulPhotographerAssignment() {
  const email = "photographer@test.com";
  const campminderId = 67890;
  
  const user = await admin.auth().createUser({ 
    uid: "test-photographer-uid",
    email 
  });
  
  await admin.firestore()
    .collection(Collection.PHOTOGRAPHERS)
    .doc(String(campminderId))
    .set({ email });
  
  const request = { auth: { uid: user.uid }, data: {} };
  const result = await wrappedFunction(request);
  
  if (result.role !== "PHOTOGRAPHER" || result.campminderId !== campminderId) {
    throw new Error(`Wrong result: ${JSON.stringify(result)}`);
  }
}

async function testSuccessfulStaffAssignment() {
  const email = "staff@test.com";
  const campminderId = 11111;
  
  const user = await admin.auth().createUser({ 
    uid: "test-staff-uid",
    email 
  });
  
  await admin.firestore()
    .collection(Collection.STAFF)
    .doc(String(campminderId))
    .set({ email });
  
  const request = { auth: { uid: user.uid }, data: {} };
  const result = await wrappedFunction(request);
  
  if (result.role !== "STAFF" || result.campminderId !== campminderId) {
    throw new Error(`Wrong result: ${JSON.stringify(result)}`);
  }
}

async function testSuccessfulAdminAssignment() {
  const email = "admin@test.com";
  const campminderId = 22222;
  
  const user = await admin.auth().createUser({ 
    uid: "test-admin-uid",
    email 
  });
  
  await admin.firestore()
    .collection(Collection.ADMINS)
    .doc(String(campminderId))
    .set({ email });
  
  const request = { auth: { uid: user.uid }, data: {} };
  const result = await wrappedFunction(request);
  
  if (result.role !== "ADMIN" || result.campminderId !== campminderId) {
    throw new Error(`Wrong result: ${JSON.stringify(result)}`);
  }
}

async function testPriorityOrder_ParentFirst() {
  const email = "priority@test.com";
  const parentCampminderId = 44444;
  const photographerCampminderId = 55555;
  
  const user = await admin.auth().createUser({ 
    uid: "test-priority-uid",
    email 
  });
  
  await admin.firestore()
    .collection(Collection.PARENTS)
    .doc(String(parentCampminderId))
    .set({ email });
  
  await admin.firestore()
    .collection(Collection.PHOTOGRAPHERS)
    .doc(String(photographerCampminderId))
    .set({ email });
  
  const request = { auth: { uid: user.uid }, data: {} };
  const result = await wrappedFunction(request);
  
  if (result.role !== "PARENT" || result.campminderId !== parentCampminderId) {
    throw new Error(`Expected PARENT role, got ${result.role}`);
  }
}

async function testUserNotInWhitelist() {
  const email = "notfound@test.com";
  
  const user = await admin.auth().createUser({ 
    uid: "test-notfound-uid",
    email 
  });
  
  const request = { auth: { uid: user.uid }, data: {} };
  
  try {
    await wrappedFunction(request);
    throw new Error("Expected error but got success");
  } catch (error: any) {
    if (error.code !== "permission-denied") {
      throw new Error(`Wrong error code: ${error.code}`);
    }
  }
  
  // Verify user was deleted
  try {
    await admin.auth().getUser(user.uid);
    throw new Error("User should have been deleted");
  } catch (error: any) {
    if (error.code !== "auth/user-not-found") {
      throw new Error(`Expected user-not-found but got: ${error.code}`);
    }
  }
}

async function testInvalidCampminderId() {
  const email = "invalid@test.com";
  
  const user = await admin.auth().createUser({ 
    uid: "test-invalid-uid",
    email 
  });
  
  await admin.firestore()
    .collection(Collection.PARENTS)
    .doc("invalid-id")
    .set({ email });
  
  const request = { auth: { uid: user.uid }, data: {} };
  
  try {
    await wrappedFunction(request);
    throw new Error("Expected error but got success");
  } catch (error: any) {
    if (error.code !== "permission-denied") {
      throw new Error(`Wrong error code: ${error.code}`);
    }
  }
  
  // Verify user was deleted
  try {
    await admin.auth().getUser(user.uid);
    throw new Error("User should have been deleted");
  } catch (error: any) {
    if (error.code !== "auth/user-not-found") {
      throw new Error(`Expected user-not-found but got: ${error.code}`);
    }
  }
}

async function runAllTests() {
  console.log("=".repeat(80));
  console.log("checkWhitelist Integration Test Suite");
  console.log("=".repeat(80));
  console.log("Running tests against Firebase emulators...");
  console.log("=".repeat(80));

  await runTest("1. Unauthenticated user", testUnauthenticatedUser);
  await runTest("2. Missing UID", testMissingUid);
  await runTest("3. User without email", testUserWithoutEmail);
  await runTest("4. Successful PARENT assignment", testSuccessfulParentAssignment);
  await runTest("5. Successful PHOTOGRAPHER assignment", testSuccessfulPhotographerAssignment);
  await runTest("6. Successful STAFF assignment", testSuccessfulStaffAssignment);
  await runTest("7. Successful ADMIN assignment", testSuccessfulAdminAssignment);
  await runTest("8. Priority order - PARENT first", testPriorityOrder_ParentFirst);
  await runTest("9. User not in whitelist", testUserNotInWhitelist);
  await runTest("10. Invalid campminderId handling", testInvalidCampminderId);

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("TEST SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total:  ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failures.length > 0) {
    console.log("\nFailed Tests:");
    failures.forEach(f => {
      console.log(`  - ${f.name}`);
      console.log(`    ${f.error}`);
    });
  }
  
  console.log("=".repeat(80));
  
  // Cleanup
  test.cleanup();
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error("Fatal error running tests:", error);
  test.cleanup();
  process.exit(1);
});

