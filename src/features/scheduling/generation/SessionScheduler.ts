import { StaffAttendeeID, AdminAttendeeID, NightShiftID, SessionID, SectionID } from "@/types/sessionTypes";
import moment, { Moment } from "moment";

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
    return arr .map(value => ({ value, sort: Math.random() })) 
    .sort((a, b) => a.sort - b.sort) 
    .map(({ value }) => value); 
  }
  private toISO(date: Moment): string {
    return date.format("YYYY-MM-DD");
  }

  private getDateStringsInRange(start: Moment, end: Moment): string[] {
    const dates: string[] = [];
    const curr = start.clone();
    while (curr.isSameOrBefore(end)) {
      dates.push(this.toISO(curr));
      curr.add(1, "day");
    }
    return dates;
  }

  private isJamboreeISO(dateISO: string, sections: SectionID[]): boolean {
    const date = moment(dateISO);
    return sections.some(section => {
      if (!('type' in section)) return false;
      const s = moment(section.startDate);
      const e = moment(section.endDate).subtract(1, "day");
      return (
        (section.type === "BUNK-JAMBO" || section.type === "NON-BUNK-JAMBO") &&
        date.isSameOrAfter(s) &&
        date.isSameOrBefore(e)
      );
    });
  }


  private assignOneDayOff(
    employee: StaffAttendeeID | AdminAttendeeID,
    candidateDates: string[],
    dayCounts: Map<string, number>,
    allEmployees: (StaffAttendeeID | AdminAttendeeID)[],
    maxStaffOffPerDay: number
  ): boolean {

    for (const date of candidateDates) {
    if ((dayCounts.get(date) ?? 0) >= maxStaffOffPerDay){
      console.log("Max staff off per day reached");
      continue;
    };
    // bunk constraint (HARD)
      if ('bunk' in employee && maxStaffOffPerDay !== Infinity) {
        const bunkConflict = allEmployees.some(e =>
          'bunk' in e &&
          e.bunk === employee.bunk &&
          e.daysOff.includes(date)
        );

        if (bunkConflict) continue;
      }

      // assign
      employee.daysOff.push(date);
      dayCounts.set(date, (dayCounts.get(date) ?? 0) + 1);
      return true;
    }

    

    return false;
  }



  assignDaysOff(session: SessionID, employees: (StaffAttendeeID | AdminAttendeeID)[]): SessionScheduler {
    try {
      const start = moment(session.startDate);

      // Define windows (days 2–6 and 7–12) (TEMP Set for default session. Need to change to handle multiple sessions)
      const window1 = this.getDateStringsInRange(start.clone().add(1, "day"), start.clone().add(5, "day"));
      const window2 = this.getDateStringsInRange(start.clone().add(6, "day"), start.clone().add(11, "day"));

      const allDates = [...window1, ...window2];
      let maxStaffOffPerDay = Math.ceil(employees.length / allDates.length);

      const dayCounts = new Map<string, number>();
      allDates.forEach(d => dayCounts.set(d, 0));

      // Separate program counselors
      const nonWFProgramCounselors = employees.filter(
        e => 'programCounselor' in e && e.programCounselor && e.programCounselor.id !== "WF"
      );
      const WFProgramCounselors = employees.filter(
        e => 'programCounselor' in e && e.programCounselor && e.programCounselor.id === "WF"
      );
      // ---- Choose exact number of WF counselors for Jamboree ----
      const numWFWindow1 = Math.ceil(WFProgramCounselors.length/window1.length); // example: 3 WF on Jamboree in window1
      const numWFWindow2 = Math.ceil(WFProgramCounselors.length/window2.length); // example: 2 WF on Jamboree in window2

      const shuffledWF = this.shuffleArray(WFProgramCounselors);
      const selectedWFWindow1 = shuffledWF.slice(0, numWFWindow1);
      const selectedWFWindow2 = shuffledWF.slice(numWFWindow1, numWFWindow1 + numWFWindow2);

      // ---- Build Jamboree sets ----
      const jamboreeWindow1 = new Set([...nonWFProgramCounselors, ...selectedWFWindow1]);
      const jamboreeWindow2 = new Set([...nonWFProgramCounselors, ...selectedWFWindow2]);

      // ---- PASS 1: window1 ----
      for (const employee of employees) {
        maxStaffOffPerDay = Math.ceil(employees.length / window1.length);
        const dates =
          'programCounselor' in employee && jamboreeWindow1.has(employee)
            ? window1.filter(d => this.isJamboreeISO(d, this.sections))
            : window1;

        if (dates.length === 1){
          // set maxStaffOffPerDay to Infinity
          maxStaffOffPerDay = Infinity;
        };

        if (!this.assignOneDayOff(employee, dates, dayCounts, employees, maxStaffOffPerDay)) {
          console.warn(`Failed to assign window-1 day off for ${employee.id}`);
        }
      }

      // ---- PASS 2: window2 ----
      for (const employee of employees) {
        maxStaffOffPerDay = Math.ceil(employees.length / window2.length);

        const dates =
          'programCounselor' in employee && jamboreeWindow2.has(employee)
            ? window2.filter(d => this.isJamboreeISO(d, this.sections))
            : window2;

        if (dates.length === 1){

          maxStaffOffPerDay = Infinity;
        };

        if (!this.assignOneDayOff(employee, dates, dayCounts, employees, maxStaffOffPerDay)) {
          console.warn(`Failed to assign window-2 day off for ${employee.id}`);
        }
      }

    } catch (e) {
      console.error(e);
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



    const currDate = startDate;

    // Create a night bunk object for each night
    while (currDate.isSameOrBefore(endDate)) {
      const shift: NightShiftID = {
        sessionId: session.id,
        id: `night-${this.toISO(currDate)}`
      };
      // looping through all unique bunks that the employees have
      for (const bunkNumber of bunks) {
        // Create NightShift object for this bunk
        shift[bunkNumber] = {
          counselorsOnDuty: [],
          nightBunkDuty: [],
        };

        // choosing employees for night shift
        const employeesInBunk = employees.filter((e) => e.bunk === bunkNumber);
        const PER_SPLIT = Math.ceil(employeesInBunk.length / 2);

        if (employeesInBunk.length === 0) continue;
        const selected: StaffAttendeeID[] = []
        
        for (const employee of employeesInBunk) {

          if (employee.daysOff.includes(this.toISO(currDate))) {
            continue;
          }
          const prevDate = currDate.clone().subtract(1, 'day');
          const nextDate = currDate.clone().add(1, 'day');

          const hasAdjacentDayOff =
            employee.daysOff.includes(this.toISO(prevDate)) ||
            employee.daysOff.includes(this.toISO(nextDate));

          if (!hasAdjacentDayOff && shift[bunkNumber].counselorsOnDuty.length + 1 < PER_SPLIT ) {
            shift[bunkNumber].counselorsOnDuty.push(employee.id);
            selected.push(employee);
          }

          else {
            shift[bunkNumber].nightBunkDuty.push(employee.id);
            selected.push(employee);
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
