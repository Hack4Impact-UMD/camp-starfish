import { Session, StaffSessionAttendee } from "@/types/sessionTypes";
import { Employee } from "@/types/personTypes";



// // mock data

// const session = {
//     startDate: "2025-07-01",
//     endDate: "2025-07-15",
// };

// // Mock employees
// const employees = [
//     {
//         campminderId: 1,
//         uid: "e1",
//         email: "a@example.com",
//         name: { firstName: "Alice", lastName: "Smith" },
//         gender: "Female",
//         role: "STAFF",
//         sessionIds: ["s1"],
//         nonoList: [],
//         daysOff: [], // no days off yet
//     },
//     {
//         campminderId: 2,
//         uid: "e2",
//         email: "b@example.com",
//         name: { firstName: "Bob", lastName: "Jones" },
//         gender: "Male",
//         role: "STAFF",
//         sessionIds: ["s1"],
//         nonoList: [],
//         daysOff: ["2025-07-02"], // already has 1 day off
//     },
//     {
//         campminderId: 3,
//         uid: "e3",
//         email: "c@example.com",
//         name: { firstName: "Charlie", lastName: "Brown" },
//         gender: "Male",
//         role: "STAFF",
//         sessionIds: ["s1"],
//         nonoList: [],
//         daysOff: ["2025-07-03", "2025-07-08"], // already at max
//     },
// ];



export function assignDaysOff(session: Session, employees: StaffSessionAttendee[]) {
}

export function assignNightShifts(session: Session, employees: StaffSessionAttendee[]) {
    const bunks = new Set()
    const startDate = new Date(session.startDate);
    const endDate = new Date(session.endDate);

    //Get unique bunks
    for (let i = 0; i < employees.length; i++) {
        bunks.add(employees[i].bunk)
    }

    for (const bunkNumber of bunks) {
        const employeesInBunk = employees.filter((e) => e.bunk === bunkNumber);
        if (employeesInBunk.length === 0) continue;
        const employeeChoices = new Set(employeesInBunk);
        const numEmployees = employeesInBunk.length;
        const numDays =
            Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
            // Sample from the filtered bunk-specific pool instead of the full employees array:
            const choices = Array.from(employeeChoices);
            if (choices.length === 0) {
                break;
            }
            const randomEmployee =
                choices[Math.floor(Math.random() * choices.length)];
                employees[Math.floor(Math.random() * numEmployees)];



            // If random employee is a program counselor
            if (randomEmployee.programCounselor) {
                const toISODate = (date: Date) => date.toISOString().split("T")[0];
                let dateISO: string;
                while (true) {
                    const randomDayIndex = Math.floor(Math.random() * numDays);
                    const randomDate = new Date(startDate);
                    randomDate.setDate(startDate.getDate() + randomDayIndex);
                    dateISO = toISODate(randomDate);
                    const nextDayISO = (() => {
                        const copy = new Date(randomDate);
                        copy.setDate(copy.getDate() + 1);
                        return toISODate(copy);
                    })();
                    const prevDayISO = (() => {
                        const copy = new Date(randomDate);
                        copy.setDate(copy.getDate() - 1);
                        return toISODate(copy);
                    })();
                    if (
                        randomEmployee.nightShifts.includes(dateISO) ||
                        randomEmployee.daysOff.includes(nextDayISO) ||
                        randomEmployee.daysOff.includes(prevDayISO)
                    ) {
                        continue;
                    }
                    break;
                }
                randomEmployee.nightShifts.push(dateISO);
            }
            // Random employee is not a program counselor
            else {
                const toISODate = (date: Date) => date.toISOString().split("T")[0];
                let dateISO: string;
                do {
                    const randomDayIndex = Math.floor(Math.random() * numDays);
                    const randomDate = new Date(startDate);
                    randomDate.setDate(startDate.getDate() + randomDayIndex);
                    dateISO = toISODate(randomDate);
                } while (randomEmployee.nightShifts.includes(dateISO));
                randomEmployee.nightShifts.push(dateISO);
                randomEmployee.nightShifts.push(dateISO);

        }

    }
}
