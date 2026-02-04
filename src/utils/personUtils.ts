import { Person } from "@/types/users/userTypes";

export function getFullName(person: Person) {
  return `${person.name.firstName} ${person.name.middleName ? `${person.name.middleName} ` : ''}${person.name.lastName}`
}