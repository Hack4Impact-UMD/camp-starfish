import { CampStarfishError } from "./CampStarfishErrors";

export class PermissionDeniedError extends CampStarfishError {

  constructor(message: string) {
    super({ source: "camp-starfish", code: "permission-denied", userMessage: message });
  }
}
