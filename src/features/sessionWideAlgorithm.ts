import { Session } from "@/types/sessionTypes";
import { Employee } from "@/types/personTypes";

const MAX_STAFF_OFF_PER_DAY = 2;
const DAYS_OFF_PER_EMPLOYEE = 2;

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



export function assignDaysOff(session: Session, employees: Employee[]) {
    const numEmployees = employees.length;

    // Track employee eligibility by uid
    const employeeChoices = new Set(employees.map((e) => e.uid));

    const startDate = new Date(session.startDate);
    const endDate = new Date(session.endDate);

    const numDays =
        Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

    const currentDate = new Date(startDate);

    for (let dayIndex = 1; dayIndex <= numDays; dayIndex++) {
        const dateStr = currentDate.toISOString().split("T")[0];

        // Skip restricted days (first, 13th, and 14th)
        if (dayIndex === 1 || dayIndex === 13 || dayIndex === 14) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }

        let numEmployeesOffOnDay = 0;

        // Keep track of attempts to avoid infinite loops
        let attempts = 0;
        const maxAttempts = numEmployees * 2;

        while (
            numEmployeesOffOnDay < MAX_STAFF_OFF_PER_DAY &&
            employeeChoices.size > 0 &&
            attempts < maxAttempts
        ) {
            attempts++;

            const randomEmployee =
                employees[Math.floor(Math.random() * numEmployees)];

            // Skip if employee has already been chosen
            if (!employeeChoices.has(randomEmployee.uid)) continue;

            // Skip if employee already has this date off
            if (randomEmployee.daysOff.includes(dateStr)) continue;

            // Checks if employee has a day off in the first half of schedule
            const firstHalf = dayIndex <= Math.floor(numDays / 2);
            const halfPointDate = new Date(startDate);
            halfPointDate.setDate(startDate.getDate() + Math.floor(numDays / 2));

            const hasDayOffInFirstHalf = randomEmployee.daysOff.some(
                (d) => new Date(d).getTime() <= halfPointDate.getTime()
            );

            const hasDayOffInSecondHalf = randomEmployee.daysOff.some(
                (d) => new Date(d).getTime() > halfPointDate.getTime()
            );

            if (
                (firstHalf && hasDayOffInFirstHalf) ||
                (!firstHalf && hasDayOffInSecondHalf)
            ) {
                continue;
            }

            // Assign day off
            randomEmployee.daysOff.push(dateStr);
            numEmployeesOffOnDay++;

            // Remove from choices if at max day-off limit
            if (randomEmployee.daysOff.length >= DAYS_OFF_PER_EMPLOYEE) {
                employeeChoices.delete(randomEmployee.uid);
            }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

export function assignNightShifts(session: Session, employees: Employee[]) {

}
