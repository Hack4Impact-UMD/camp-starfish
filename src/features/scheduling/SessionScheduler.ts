import { StaffAttendeeID, AdminAttendeeID, NightShiftID, SessionID, SectionID } from "@/types/sessionTypes";

export class SessionScheduler {
  session: SessionID | undefined;
  sections: SectionID[] = [];
  counselors: (StaffAttendeeID | AdminAttendeeID)[] = [];
  nightShifts: NightShiftID[] = [];

  constructor() { }

  withSession(session: SessionID): SessionScheduler { this.session = session; return this; }

  withSections(sections: SectionID[]): SessionScheduler { this.sections = sections; return this; }

  withCounselors(counselors: (StaffAttendeeID | AdminAttendeeID)[]): SessionScheduler { this.counselors = counselors; return this; }

  withNightShifts(nightShifts: NightShiftID[]): SessionScheduler { this.nightShifts = nightShifts; return this; }

  assignDaysOff(session: SessionID, employees: StaffAttendeeID[]): SessionScheduler {
    const MAX_STAFF_OFF_PER_DAY = 2;
    const DAYS_OFF_PER_EMPLOYEE = 2;
    const numEmployees = employees.length;

    const employeeChoices = new Set(employees);

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
        if (!employeeChoices.has(randomEmployee)) continue;

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
          employeeChoices.delete(randomEmployee);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return this;
  }

  assignNightShifts(session: SessionID, employees: StaffAttendeeID[]): SessionScheduler {
    const bunks = new Set<number>();
    const startDate = new Date(session.startDate);
    const endDate = new Date(session.endDate);
    const numDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

    // Collect unique bunks
    for (let i = 0; i < employees.length; i++) {
      bunks.add(employees[i].bunk);
    }

    const toISODate = (date: Date) => date.toISOString().split("T")[0];

    for (const bunkNumber of bunks) {
      const employeesInBunk = employees.filter((e) => e.bunk === bunkNumber);
      if (employeesInBunk.length === 0) continue;

      const employeeChoices = new Set(employeesInBunk);
      const choices = Array.from(employeeChoices);
      if (choices.length === 0) continue;

      // Create NightShift object for this bunk
      const shift: NightShiftID = {
        id: `night-${bunkNumber}-${session.id}`,
        sessionId: session.id,
        [bunkNumber]: {
          counselorsOnDuty: [],
          nightBunkDuty: [],
        },
      };

      // Pick a random employee
      const randomEmployee = choices[Math.floor(Math.random() * choices.length)];

      // employee is a progrma counselor, check if they have day off before or after
      if (randomEmployee.programCounselor) {
        const eligible = !randomEmployee.daysOff.some((day) => {
          const dayDate = new Date(day);
          const prev = new Date(dayDate);
          prev.setDate(prev.getDate() - 1);
          const next = new Date(dayDate);
          next.setDate(next.getDate() + 1);
          return prev <= endDate && randomEmployee.daysOff.includes(toISODate(prev)) ||
            next <= endDate && randomEmployee.daysOff.includes(toISODate(next));
        });

        if (eligible) {
          shift[bunkNumber].counselorsOnDuty.push(randomEmployee.id);
        }
      } else { // not a program counsoler, choosen employee gets night shift
        shift[bunkNumber].nightBunkDuty.push(randomEmployee.id);
      }

      // Save the shift object
      this.nightShifts.push(shift);
    }

    return this;
  }

  getSchedule(): { nightShifts: NightShiftID[] } { return { nightShifts: this.nightShifts }; }
}