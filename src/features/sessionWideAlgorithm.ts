import { Session } from "@/types/sessionTypes";
import { Employee } from "@/types/personTypes";

const MINIMUM_EMPLOYEES_PER_DAY = 5;
const DAYS_OFF_PER_EMPLOYEE = 2;

export function assignDaysOff(session: Session, employees: Employee[]) {
    const minEmployeesPerDay = MINIMUM_EMPLOYEES_PER_DAY;
    const numEmployees = employees.length;
    const employeeChoices = new Set(employees);
    const startDate = session.startDate;
    const endDate = session.endDate;

    const numDays = Math.floor((Date.parse(endDate) - Date.parse(startDate)) / 86400000);
    
    const currentDate = new Date(startDate);

    //Assigning (employees.size - MINIMUM_EMPLOYEES_PER_DAY) employees for each day between start and end date
    for (let i = 0; i <= numDays; i++) {
        if (employeeChoices.size == 0) { //If we have already assigned all the employees, exit out of loop
            break;
        }
        let numEmployeesOffOnDay = 0;
        while (numEmployeesOffOnDay < numEmployees - minEmployeesPerDay && employeeChoices.size > 0) {
            let randomEmployeeID = Math.floor(Math.random() * (numEmployees));
            const currEmployee = employees[randomEmployeeID]
            if (!employeeChoices.has(currEmployee)) {
                continue;
            }
            const dateStr = currentDate.toISOString().split("T")[0];

            // Skip if employee already has this date off
            if (currEmployee.daysOff.includes(dateStr)) {
                continue;
            }

            // Assign day off
            currEmployee.daysOff.push(dateStr);
            numEmployeesOffOnDay++;
            // remove employee from choices if already reached max day off limit
            if (currEmployee.daysOff.length == DAYS_OFF_PER_EMPLOYEE) {
                employeeChoices.delete(currEmployee)
            }
        }

    }
}

export function assignNightShifts(session: Session, employees: Employee[]) {

}
