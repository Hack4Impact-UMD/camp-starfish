import { StaffAttendeeID, AdminAttendeeID, NightShiftID, SessionID, SectionID, NightShift } from "@/types/sessionTypes";
import { Moment } from "moment";
import moment from "moment";

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



  private shuffleArray<T>(arr: T[]): T[] {
    return arr
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  private getDateRange(startDate: Moment, endDate: Moment) {
    let fromDate = startDate
    let toDate = endDate
    let diff = toDate.diff(fromDate, "day")
    let range = []
    for (let i = 0; i < diff; i++) {
      range.push(moment(startDate).add(i, "day"))
    }
    return range
  }

  private isDateEligible(date: Moment, eligibleDates: Set<Moment>): boolean {
    for (const eligibleDate of eligibleDates) {
      if (eligibleDate.isSame(date, 'day')) {
        return true;
      }
    }
    return false;
  }

  //Convert moment string to iso string
  private toISODate(date: Moment): string {
    return date.format("YYYY-MM-DD");
  }

  // Helper function to check if a date is a Jamboree day
  private isJamboreeDay(date: Moment, sections: SectionID[]): boolean {
    const dateStr = this.toISODate(date);
    return sections.some(section => {
      if (!('type' in section)) {
        return false;
      }
      const sectionStart = moment(section.startDate);
      const sectionEnd = moment(section.endDate).subtract(1, 'day');
      return (
        (section.type === 'BUNK-JAMBO' || section.type === 'NON-BUNK-JAMBO') &&
        date.isSameOrAfter(sectionStart) &&
        date.isSameOrBefore(sectionEnd)
      );
    });
  }



  private assignDaysOffForWeek(
    weekStart: Moment,
    weekEnd: Moment,
    eligibleDates: Set<Moment>,
    employees: (StaffAttendeeID | AdminAttendeeID)[],
    employeesNeedingDayOff: Set<StaffAttendeeID | AdminAttendeeID>,
    maxStaffOffPerDay: number
  ): void {
    // Get all eligible dates in this week
    const datesInWeek: Moment[] = [];
    const currentDate = weekStart.clone();

    // Add all the dates that are in this week to the list
    while (currentDate.isSameOrBefore(weekEnd)) {
      if (this.isDateEligible(currentDate, eligibleDates)) {
        datesInWeek.push(currentDate.clone());
      }
      currentDate.add(1, 'day');
    }

    if (datesInWeek.length === 0) return; // invalid start and end date

    // Track days off assigned per day
    const daysOffCount = new Map<string, number>();
    datesInWeek.forEach(date => daysOffCount.set(this.toISODate(date), 0));

    // Separate Program Counselors and others
    const programCounselors = Array.from(employeesNeedingDayOff).filter(e =>
      'programCounselor' in e && e.programCounselor
    );
    const otherEmployees = Array.from(employeesNeedingDayOff).filter(e =>
      !('programCounselor' in e && e.programCounselor)
    );

    // Assign Program Counselors first, prioritizing Jamboree days
    for (const employee of this.shuffleArray(programCounselors)) {
      const jamboreeeDates = datesInWeek.filter(date =>
        this.isJamboreeDay(date, this.sections) // get all jamboree dates for this section in the week
      );
      const preferredDates = jamboreeeDates.length > 0 ? jamboreeeDates : datesInWeek;

      // Assign day off
      if (this.assignDayOffToEmployee(employee, preferredDates, daysOffCount, maxStaffOffPerDay, employees)) {
        employeesNeedingDayOff.delete(employee);
      }
    }

    // Assign other employees
    for (const employee of this.shuffleArray(otherEmployees)) {
      if (this.assignDayOffToEmployee(employee, datesInWeek, daysOffCount, maxStaffOffPerDay, employees)) {
        employeesNeedingDayOff.delete(employee);
      }
    }
  }

  private assignDayOffToEmployee(
    employee: StaffAttendeeID | AdminAttendeeID,
    availableDates: Moment[],
    daysOffCount: Map<string, number>,
    maxStaffOffPerDay: number,
    allEmployees: (StaffAttendeeID | AdminAttendeeID)[]
  ): boolean {


    // gets all the dates from available dates that dont have the max staff off per day.
    const unfilledDates = availableDates.filter((date) => {
      const dateStr = this.toISODate(date);
      const currentCount = daysOffCount.get(dateStr) || 0;
      return currentCount < maxStaffOffPerDay && !employee.daysOff.includes(dateStr);
    })

    // sort the unfilledDates by unfilledDates[0] being the date where the most number of available employees in a bunk
    // need a day off

    unfilledDates.sort((date1: Moment, date2: Moment) => {
      const dateStrA = this.toISODate(date1);
      const dateStrB = this.toISODate(date2);
      const countA = daysOffCount.get(dateStrA) || 0;
      const countB = daysOffCount.get(dateStrB) || 0;

      // sorts the array so that the dates with the least amoutnt of employees off appear first.
      if (countA !== countB) {
        return countA - countB;
      }

      // for equal counts of employees off on two dates, sort by the bunks with the least amount of employees off
      else {
        let bunk = null;
        if ('bunk' in employee) {
          bunk = employee.bunk
        }
        if (bunk) {
          // gets the number of people off on dateStrA in the employee bunk
          const numOffBunkA = allEmployees.filter(e =>
            'bunk' in e && e.bunk === bunk && e.daysOff.includes(dateStrA)
          ).length;
          // gets the number of people off on dateStrB in the employee bunk
          const numBunkOffB = allEmployees.filter(e =>
            'bunk' in e && e.bunk === bunk && e.daysOff.includes(dateStrB)
          ).length;
          // If dateA already has an employee off in the same bunk, put dateB before dateA. Otherwise,
          // put dateA before dateB.
          if (numOffBunkA > numBunkOffB) return 1;
          if (numOffBunkA < numBunkOffB) return -1;
        }

      }
      return 0; // equal dates, and both dates have someone off on that bunk.
    })

    // At the end of this sorting algorithm, unfilledDates will include all of the dates that are not
    // filled with the max number of staff with days off allowed in the session, and will be sorted on 
    // two keys: 
    // 1. Dates with less employees off on that day will appear first
    // 2. Dates with less bunk members off on that day will appear first

    if (unfilledDates.length === 0) return false; // if no dates are avaiable due to our criteria. 

    const selectedDate = unfilledDates[0]; // first element will have most optimal day off to assign
    const dateStr = this.toISODate(selectedDate);

    employee.daysOff.push(dateStr); // assign date to employee
    daysOffCount.set(dateStr, (daysOffCount.get(dateStr) || 0) + 1);

    return true;


  }


  assignDaysOff(session: SessionID, employees: (StaffAttendeeID | AdminAttendeeID)[]): SessionScheduler {
    const start = moment(session.startDate);  // ISO 8601 string
    const end = moment(session.endDate).subtract(1, 'day');

    const NUM_WEEKS = Math.ceil(end.diff(start, "week", true));
    const NUM_DAYS = (end.diff(start, "day")) + 1
    const MAX_STAFF_OFF_PER_DAY = Math.ceil(employees.length / NUM_DAYS);
    const employeesNeedingDayOff = new Set(employees);

    let currDate = start;
    // Need a future implementation for this date range to only include dates that allow for a day off.
    const sessionDateRange: Set<Moment> = new Set(this.getDateRange(start, end))

    for (let i = 0; i < NUM_WEEKS; i++) {
      if (currDate.clone().add(1, "week").isBefore(end)) {
        this.assignDaysOffForWeek(currDate, currDate.clone().add(6, "day"), sessionDateRange, employees, employeesNeedingDayOff, MAX_STAFF_OFF_PER_DAY)
        currDate.add(6, "day")
      }
      else {
        this.assignDaysOffForWeek(currDate, end, sessionDateRange, employees, employeesNeedingDayOff, MAX_STAFF_OFF_PER_DAY)
        currDate = end
      }

    }

    return this;


  }



  assignNightShifts(session: SessionID, employees: StaffAttendeeID[]): SessionScheduler {
    const bunks = new Set<number>();
    const endDate = moment(session.endDate).subtract(1, 'day');
    const startDate = moment(session.startDate);

    // Collect unique bunks
    for (let i = 0; i < employees.length; i++) {
      bunks.add(employees[i].bunk);
    }



    let currDate = startDate;

    // Create a night bunk object for each night
    while (currDate.isSameOrBefore(endDate)) {
      const shift: NightShiftID = {
        sessionId: session.id,
        id: `night-${this.toISODate(currDate)}`
      };
      // looping through all unique bunks that the employees have
      for (const bunkNumber of bunks) {
        // Create NightShift object for this bunk
        shift[bunkNumber] = {
          counselorsOnDuty: [],
          nightBunkDuty: [],
        };

        // choosing 4 employees
        const employeesInBunk = employees.filter((e) => e.bunk === bunkNumber);
        if (employeesInBunk.length === 0) continue;
        const shuffled = this.shuffleArray(employeesInBunk);
        const selected = shuffled.slice(0, 4);

        for (const employee of selected) {
          const prevDate = currDate.clone().subtract(1, 'day');
          const nextDate = currDate.clone().add(1, 'day');

          const hasAdjacentDayOff =
            employee.daysOff.includes(this.toISODate(prevDate)) ||
            employee.daysOff.includes(this.toISODate(nextDate));

          // If no adjacent day off, eligible for COD
          // Otherwise, assign to NBD
          if (!hasAdjacentDayOff) {
            shift[bunkNumber].counselorsOnDuty.push(employee.id);
          } else {
            shift[bunkNumber].nightBunkDuty.push(employee.id);
          }

        }
      }
      // Save the shift object
      this.nightShifts.push(shift);
      currDate.add(1, "day");
    }
    return this;




  }

  getSchedule(): { nightShifts: NightShiftID[] } { return { nightShifts: this.nightShifts }; }
}