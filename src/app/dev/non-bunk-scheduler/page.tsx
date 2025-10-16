"use client";
import { NonBunkJamboreeScheduler } from "@/features/scheduling/NonBunkJamboreeScheduler";
import { useState } from "react";
import {
  SectionSchedule,
  CamperAttendeeID,
  StaffAttendeeID,
  AdminAttendeeID,
  IndividualAssignments,
  JamboreeActivity,
  AgeGroup,
  SectionPreferences,
} from "@/types/sessionTypes";

function makeActivity(name: string): JamboreeActivity & { assignments: IndividualAssignments } {
  return {
    name,
    description: "",
    assignments: { camperIds: [], staffIds: [], adminIds: [] },
  };
}

function makeBlock(activities: string[]) {
  return activities.map(makeActivity);
}

function TestPage() {
  const blocksToAssign = ["block-1", "block-2"];

  const schedule: SectionSchedule<"NON-BUNK-JAMBO"> = {
    blocks: {
      "block-1": {
        activities: makeBlock(["Archery", "Crafts", "Freeplay"]),
        periodsOff: [],
      },
      "block-2": {
        activities: makeBlock(["Swimming", "Boating", "Freeplay"]),
        periodsOff: [],
      },
    },
    alternatePeriodsOff: {},
  };

  const campers: CamperAttendeeID[] = [
    {
      id: 101,
      sessionId: "S1",
      name: { firstName: "Camper", lastName: "A" },
      gender: "Female",
      dateOfBirth: "2012-01-01",
      nonoList: [],
      role: "CAMPER",
      ageGroup: "NAV" as AgeGroup,
      level: 1,
      bunk: 1,
      swimOptOut: false,
    },
    {
      id: 102,
      sessionId: "S1",
      name: { firstName: "Camper", lastName: "B" },
      gender: "Male",
      dateOfBirth: "2011-06-01",
      nonoList: [104],
      role: "CAMPER",
      ageGroup: "OCP" as AgeGroup,
      level: 1,
      bunk: 2,
      swimOptOut: false,
    },
    {
      id: 103,
      sessionId: "S1",
      name: { firstName: "Camper", lastName: "C" },
      gender: "Female",
      dateOfBirth: "2013-03-15",
      nonoList: [],
      role: "CAMPER",
      ageGroup: "OCP" as AgeGroup,
      level: 1,
      bunk: 3,
      swimOptOut: false,
    },
    {
      id: 104,
      sessionId: "S1",
      name: { firstName: "Camper", lastName: "D" },
      gender: "Male",
      dateOfBirth: "2012-09-09",
      nonoList: [102],
      role: "CAMPER",
      ageGroup: "NAV" as AgeGroup,
      level: 1,
      bunk: 1,
      swimOptOut: false,
    },
    {
      id: 105,
      sessionId: "S1",
      name: { firstName: "Camper", lastName: "E" },
      gender: "Female",
      dateOfBirth: "2012-04-04",
      nonoList: [201, 301],
      role: "CAMPER",
      ageGroup: "OCP" as AgeGroup,
      level: 1,
      bunk: 2,
      swimOptOut: false,
    },
    {
      id: 106,
      sessionId: "S1",
      name: { firstName: "Camper", lastName: "F" },
      gender: "Male",
      dateOfBirth: "2011-11-11",
      nonoList: [],
      role: "CAMPER",
      ageGroup: "NAV" as AgeGroup,
      level: 1,
      bunk: 3,
      swimOptOut: false,
    },
  ];

  const staff: StaffAttendeeID[] = [
    {
      id: 201,
      sessionId: "S1",
      name: { firstName: "Staff", lastName: "A" },
      gender: "Male",
      nonoList: [105],
      yesyesList: [],
      role: "STAFF",
      programCounselor: { name: "Archery", isDeleted: false },
      bunk: 1,
      leadBunkCounselor: false,
      daysOff: [],
    },
    {
      id: 202,
      sessionId: "S1",
      name: { firstName: "Staff", lastName: "B" },
      gender: "Female",
      nonoList: [],
      yesyesList: [302],
      role: "STAFF",
      programCounselor: { name: "Swimming", isDeleted: false },
      bunk: 2,
      leadBunkCounselor: false,
      daysOff: [],
    },
    {
      id: 203,
      sessionId: "S1",
      name: { firstName: "Staff", lastName: "C" },
      gender: "Male",
      nonoList: [],
      yesyesList: [],
      role: "STAFF",
      programCounselor: { name: "Crafts", isDeleted: false },
      bunk: 3,
      leadBunkCounselor: false,
      daysOff: [],
    },
    {
      id: 204,
      sessionId: "S1",
      name: { firstName: "Staff", lastName: "D" },
      gender: "Female",
      nonoList: [],
      yesyesList: [],
      role: "STAFF",
      programCounselor: { name: "Boating", isDeleted: false },
      bunk: 4,
      leadBunkCounselor: false,
      daysOff: [],
    },
    {
      id: 205,
      sessionId: "S1",
      name: { firstName: "Staff", lastName: "E" },
      gender: "Male",
      nonoList: [],
      yesyesList: [],
      role: "STAFF",
      programCounselor: { name: "Freeplay", isDeleted: false },
      bunk: 5,
      leadBunkCounselor: false,
      daysOff: [],
    },
    {
      id: 206,
      sessionId: "S1",
      name: { firstName: "Staff", lastName: "F" },
      gender: "Female",
      nonoList: [],
      yesyesList: [],
      role: "STAFF",
      programCounselor: { name: "Archery", isDeleted: false },
      bunk: 6,
      leadBunkCounselor: false,
      daysOff: [],
    },
  ];

  const admins: AdminAttendeeID[] = [
    {
      id: 301,
      sessionId: "S1",
      name: { firstName: "Admin", lastName: "A" },
      gender: "Female",
      nonoList: [105],
      yesyesList: [],
      role: "ADMIN",
      daysOff: [],
    },
    {
      id: 302,
      sessionId: "S1",
      name: { firstName: "Admin", lastName: "B" },
      gender: "Male",
      nonoList: [],
      yesyesList: [202],
      role: "ADMIN",
      daysOff: [],
    },
    {
      id: 303,
      sessionId: "S1",
      name: { firstName: "Admin", lastName: "C" },
      gender: "Female",
      nonoList: [],
      yesyesList: [],
      role: "ADMIN",
      daysOff: [],
    },
    {
      id: 304,
      sessionId: "S1",
      name: { firstName: "Admin", lastName: "D" },
      gender: "Male",
      nonoList: [],
      yesyesList: [],
      role: "ADMIN",
      daysOff: [],
    },
    {
      id: 305,
      sessionId: "S1",
      name: { firstName: "Admin", lastName: "E" },
      gender: "Female",
      nonoList: [],
      yesyesList: [],
      role: "ADMIN",
      daysOff: [],
    },
    {
      id: 306,
      sessionId: "S1",
      name: { firstName: "Admin", lastName: "F" },
      gender: "Male",
      nonoList: [],
      yesyesList: [],
      role: "ADMIN",
      daysOff: [],
    },
  ];

  const camperPrefs: SectionPreferences = {
    "block-1": {
      101: { Archery: 3, Crafts: 2 },
      102: { Crafts: 3, Archery: 1 },
      103: { Freeplay: 3, Archery: 2 },
      104: { Freeplay: 2, Crafts: 1 },
      105: { Crafts: 3 },
      106: { Archery: 2, Freeplay: 1 },
    },
    "block-2": {
      101: { Swimming: 3, Boating: 1 },
      102: { Boating: 3, Swimming: 2 },
      103: { Swimming: 2, Freeplay: 1 },
      104: { Boating: 2 },
      105: { Swimming: 1 },
      106: { Boating: 2, Swimming: 1 },
    },
  };

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function runScheduler(randomize = false) {
    const localSchedule = JSON.parse(JSON.stringify(schedule)) as typeof schedule;
    const localCampers = randomize ? shuffle(campers) : [...campers];
    const localStaff = randomize ? shuffle(staff) : [...staff];
    const localAdmins = randomize ? shuffle(admins) : [...admins];
    const localPrefs = JSON.parse(JSON.stringify(camperPrefs)) as typeof camperPrefs;
    const localBlocks = randomize ? shuffle(blocksToAssign) : blocksToAssign;

    return new NonBunkJamboreeScheduler()
      .withSchedule(localSchedule)
      .withCampers(localCampers)
      .withStaff(localStaff)
      .withAdmins(localAdmins)
      .withCamperPrefs(localPrefs)
      .forBlocks(localBlocks)
      .assignPeriodsOff()
      .assignCampers()
      .assignAdmins()
      .assignCounselors()
      .getSchedule();
  }

  const [result, setResult] = useState(() => runScheduler());
  const [randomize, setRandomize] = useState(true);
  const [lastRun, setLastRun] = useState<string>(() => new Date().toLocaleTimeString());

  function validateSchedule() {
    const issues: string[] = [];
    // 1 Admin should be present at every Activity
    for (const [blockId, block] of Object.entries(result.blocks)) {
      for (const activity of block.activities) {
        if (!activity.assignments.adminIds.length) {
          issues.push(`No admin assigned to activity '${activity.name}' in ${blockId}`);
        }
        // Staff:Camper ratio ~1:1 (soft check)
        const c = activity.assignments.camperIds.length;
        const s = activity.assignments.staffIds.length;
        if (c > 0 && s === 0) {
          issues.push(`No staff overseeing campers in '${activity.name}' (${blockId})`);
        }
      }
    }
    // Relationship pairs shouldn't be in same activity (not enforced)
    const relationships: Array<[number, number]> = [];
    for (const st of staff) {
      for (const ad of admins) {
        if (st.yesyesList?.includes(ad.id) && ad.yesyesList?.includes(st.id)) {
          relationships.push([st.id, ad.id]);
        }
      }
    }
    for (const [blockId, block] of Object.entries(result.blocks)) {
      for (const activity of block.activities) {
        for (const [sid, aid] of relationships) {
          const together = activity.assignments.staffIds.includes(sid) && activity.assignments.adminIds.includes(aid);
          if (together) {
            issues.push(`Relationship pair (${sid}, ${aid}) assigned together in '${activity.name}' (${blockId})`);
          }
        }
      }
    }
    return issues;
  }
  const validationIssues = validateSchedule();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Non-Bunk Jamboree Scheduler Test</h1>
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => { setResult(runScheduler(randomize)); setLastRun(new Date().toLocaleTimeString()); }}
        >
          Re-run scheduler
        </button>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} />
          Randomize on re-run
        </label>
        <div className="text-xs text-gray-600">Last run: {lastRun}</div>
      </div>
      <div>
        <h2 className="font-medium">Blocks</h2>
        {Object.entries(result.blocks).map(([blockId, block]) => (
          <div key={blockId} className="mt-3 border rounded">
            <div className="px-3 py-2 font-medium bg-gray-50">{blockId}</div>
            <div className="p-3 space-y-2">
              {block.activities.map((a, idx) => (
                <div key={idx} className="border rounded">
                  <div className="px-3 py-2 font-medium">Activity: {a.name}</div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Camper IDs</div>
                      <div className="mt-1">{a.assignments.camperIds.join(", ") || "-"}</div>
                    </div>
                    <div>
                      <div className="font-medium">Staff IDs</div>
                      <div className="mt-1">{a.assignments.staffIds.join(", ") || "-"}</div>
                    </div>
                    <div>
                      <div className="font-medium">Admin IDs</div>
                      <div className="mt-1">{a.assignments.adminIds.join(", ") || "-"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-medium">Alternate Periods Off (by block)</h2>
        <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(result.alternatePeriodsOff, null, 2)}
        </pre>
      </div>
      <div>
      </div>
      <div>
        <h2 className="font-medium">Camper Preferences</h2>
        <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(camperPrefs, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default TestPage;
