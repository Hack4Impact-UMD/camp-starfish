import { CampStarfishError } from "./CampStarfishErrors";

export class InvalidArgumentsError extends CampStarfishError {

  constructor(message: string) {
    super({ source: "camp-starfish", code: "invalid-arguments", userMessage: message });
  }
}
