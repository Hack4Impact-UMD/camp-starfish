import { FirebaseError } from "firebase/app";
import { FirestoreError } from "firebase/firestore";
import { GaxiosError } from "gaxios";
import { AuthError } from "firebase/auth";
export type CampStarfishErrorSource =
  | "firestore"
  | "auth"
  | "firebase-cloud"
  | "gaxios"
  | "apps-script"
  | "network"
  | "camp-starfish";

export type CampStarfishErrorParams = {
  source: CampStarfishErrorSource;
  code: string;
  userMessage: string;
  errorObject?: unknown;
}

export class CampStarfishError extends Error {
  readonly source: CampStarfishErrorSource;
  readonly code: string;
  readonly originalError?: unknown;
  readonly userMessage: string;

  constructor(error: CampStarfishErrorParams){
    super(error.userMessage);
    this.userMessage = error.userMessage;
    this.source = error.source;
    this.code = error.code;
    this.originalError = error.errorObject;
  }
}

export function wrapFirestoreError(error: unknown, message: string): CampStarfishError {
  if (error instanceof FirestoreError) {
    return new CampStarfishError({
      source: "firestore",
      code: error.code,
      userMessage: message,
      errorObject: error
    });
  }
  return new CampStarfishError({
    source: "camp-starfish",
    code: "unknown",
    userMessage: message,
    errorObject: error
  });
}

export function wrapAuthError(error: unknown, message: string): CampStarfishError {
  if (error instanceof FirebaseError && error.code.startsWith("auth/")) {
    return new CampStarfishError({
      source: "auth",
      code: error.code,
      userMessage: message,
      errorObject: error
    });
  }
  return new CampStarfishError({
    source: "camp-starfish",
    code: "unknown",
    userMessage: message,
    errorObject: error
  });
}