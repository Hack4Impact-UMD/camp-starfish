export function getFunctionsURL(functionName: string) {
  return process.env.NODE_ENV === 'development' ? `http://localhost:5001/camp-starfish/us-central1/${functionName}` : `https://${functionName.toLowerCase()}-73tqko2fca-uc.a.run.app`;
}