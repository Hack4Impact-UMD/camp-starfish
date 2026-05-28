
import { StaffAttendee, AdminAttendee, NightSchedule, Session, Section } from "@/types/sessions/sessionTypes";

export class SessionScheduler {
  session: Session | undefined;
  sections: Section[] = [];
  counselors: (StaffAttendee | AdminAttendee)[] = [];
  nightShifts: NightSchedule[] = [];

  constructor() { }

  withSession(session: Session): SessionScheduler { this.session = session; return this; }

  withSections(sections: Section[]): SessionScheduler { this.sections = sections; return this; }

  withCounselors(counselors: (StaffAttendee | AdminAttendee)[]): SessionScheduler { this.counselors = counselors; return this; }

  withNightShifts(nightShifts: NightSchedule[]): SessionScheduler { this.nightShifts = nightShifts; return this; }

  assignDaysOff(): SessionScheduler { return this; }

  assignNightShifts(): SessionScheduler { return this; }

  getSchedule(): { nightShifts: NightSchedule[] } { return { nightShifts: this.nightShifts }; }
}
