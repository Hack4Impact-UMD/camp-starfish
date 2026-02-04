import { User } from "./userTypes";

export function getFullName(user: User) {
  return `${user.name.firstName} ${user.name.middleName ? `${user.name.middleName} ` : ''}${user.name.lastName}`
}