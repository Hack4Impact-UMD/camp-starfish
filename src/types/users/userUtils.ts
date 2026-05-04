import { Name } from "./userTypes";

export function getFullName(name: Name) {
  return `${name.firstName} ${name.middleName ? `${name.middleName} ` : ''}${name.lastName}`
}