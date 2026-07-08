import { getEnvironment } from "./utils";

export function getFunctionsURL(functionName: string) {
  return getEnvironment() === 'development' ? `http://localhost:5001/camp-starfish/us-central1/${functionName}` : `https://${functionName.toLowerCase()}-73tqko2fca-uc.a.run.app`;
}