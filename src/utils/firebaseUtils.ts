export function getFunctionsURL(functionName: string) {
  return process.env.NODE_ENV === 'development' ? `${process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST}/camp-starfish/us-central1/${functionName}` : `https://${functionName.toLowerCase()}-73tqko2fca-uc.a.run.app`;
}