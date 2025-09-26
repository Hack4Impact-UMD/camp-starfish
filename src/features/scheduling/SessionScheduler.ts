import { StaffAttendeeID, AdminAttendeeID, CamperAttendeeID, NightShiftID, SessionID, SectionID } from "@/types/sessionTypes";

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

  assignDaysOff(): SessionScheduler { return this; }

  assignNightShifts(): SessionScheduler { return this; }

  getSchedule(): { nightShifts: NightShiftID[] } { return { nightShifts: this.nightShifts }; }
}