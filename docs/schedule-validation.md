# Schedule validation

The validators return `{ isValid, issues }`. Each issue includes a stable code, severity, display message, and relevant location IDs. A schedule is valid when it has no errors; warnings may remain.

## Validation checklist

All checks produce errors unless marked **warning**. Warnings do not make `isValid` false.

### General checks

| Requirement / description | Issue code | How it is verified |
| --- | --- | --- |
| Schedule data has the expected structure. | `INVALID_SCHEDULE` | Zod checks required fields, activity shapes, integer ID arrays, and night dates. Section schedules must contain at least one block. |
| Assigned people exist in the session roster. | `UNKNOWN_ASSIGNEE` | Looks up assigned people, expanded bunk members, and period-off IDs in the attendee map. |
| Assigned bunks exist. | `UNKNOWN_BUNK` | Looks up scheduled bunk numbers in the supplied bunk list. |
| People appear in the correct role lists. | `WRONG_ASSIGNMENT_LIST` | Compares each person's role with their assignment list. Also rejects campers in period-off lists and night roles. |
| Assignment lists contain no duplicate entries. | `DUPLICATE_ASSIGNMENT` | Uses sets to detect repeated person IDs or bunk numbers within a list. |

### Section assignment and availability checks

Implemented in [`validateSectionSchedule.ts`](../src/features/scheduling/validation/validateSectionSchedule.ts).

| Requirement / description | Issue code | How it is verified |
| --- | --- | --- |
| A camper cannot attend multiple activities in the same block. | `CAMPER_ACTIVITY_COLLISION` | Checks whether the camper's block placement map contains multiple activities. |
| Staff/admin cannot oversee multiple activities in the same block. | `COUNSELOR_ACTIVITY_COLLISION` | Checks whether the counselor's block placement map contains multiple activities. |
| Every camper needs an activity in every block. | `CAMPER_MISSING_ACTIVITY` | Checks every camper for an entry in the block's placement map. |
| Every staff member and admin must be accounted for. | `COUNSELOR_UNACCOUNTED` | Requires an activity, a period off in that block, or days off covering the entire section. |
| Every bunk needs an activity during a bunk jamboree. | `BUNK_MISSING_ACTIVITY` | Checks each bunk for an assignment in every block. |
| A bunk cannot attend multiple activities in one block. | `BUNK_ACTIVITY_COLLISION` | Checks whether the bunk's placement map contains multiple activities. |
| Counselors cannot work during their period off. | `ASSIGNED_DURING_PERIOD_OFF` | Checks whether explicitly assigned counselors also appear in the block's `periodsOff`. |
| Counselors cannot work during a day off. | `SCHEDULED_ON_DAY_OFF` | Checks whether an assigned counselor has a day off overlapping the section's dates. |
| Counselors should receive a period off. **Warning.** | `COUNSELOR_MISSING_PERIOD_OFF` | Looks for at least one block or alternate period off, unless the person is off for the entire section. |

For bunk jamborees, bunk assignments expand into their campers and staff. Staff on a block period off or off for the entire section are excluded from those implicit assignments. An alternate period off does not excuse an absence during an activity block.

### Activity composition and pairing checks

| Requirement / description | Issue code | How it is verified |
| --- | --- | --- |
| People on each other's no-no lists cannot share an activity. | `NONO_CONFLICT` | Checks each member's no-no list against the activity's members. Either person listing the restriction is sufficient; each pair is reported once per activity. |
| Counselors in a relationship cannot share an activity. | `RELATIONSHIP_SAME_ACTIVITY` | Builds unique relationship pairs from yes-yes lists and checks whether both people are assigned together. A relationship listed by either person is sufficient. |
| Relationship pairs should have the same periods off. **Warning.** | `RELATIONSHIP_DIFFERENT_PERIOD_OFF` | Compares their sets of block and alternate period-off slots. |
| Every activity needs an administrator. | `MISSING_ADMIN` | Counts valid assigned admins and flags zero. Staff program counselors do not count as admins. |
| Staff-to-camper counts should be close to 1:1. **Warning.** | `STAFF_CAMPER_RATIO` | Flags an absolute difference greater than one between distinct staff and camper counts. Admins are excluded from the staff count. |
| Activities should contain campers. **Warning.** | `EMPTY_ACTIVITY` | Flags activities with zero valid assigned campers. |

### Bundle-specific checks

These checks do not apply to jamboree schedules.

| Requirement / description | Issue code | How it is verified |
| --- | --- | --- |
| Campers must match the activity's age group. | `AGE_GROUP_MISMATCH` | Compares camper and activity age groups. Also requires OCP campers for OCP chats. |
| A program area can appear only once per block. | `DUPLICATE_PROGRAM_AREA` | Tracks program-area IDs in a set and flags repeats, even with different age-group labels. |
| Ordinary activities need 4–9 campers, ideally 5–8. | `CAMPER_DISTRIBUTION` | Counts distinct valid campers. Outside 4–9 is an error; 4 or 9 is a warning. Swim/chat are excluded. |
| An activity's designated program counselors must attend. | `PROGRAM_COUNSELOR_MISSING` | Finds staff whose `programCounselorFor` matches the activity's area and checks their assignment. |
| An unavailable program counselor needs coverage review. **Warning.** | `PROGRAM_COUNSELOR_UNAVAILABLE` | Used instead of the missing-counselor error when that counselor has a period off or overlapping day off. |
| Campers who require swim must receive exactly one swim block. | `SWIM_COUNT` | Counts each camper's swim assignments across the bundle and compares with the expected count. |
| Eligible OCP campers who opted out must not receive swim. | `SWIM_OPTED_OUT` | Requires zero swim assignments for OCP levels 4–5 who opted out after the first bundle. |
| Swim must occur in the allowed blocks. | `SWIM_WRONG_BLOCK` | Checks NAV swim against C–E and OCP swim against A–B. |
| Every OCP camper needs exactly one OCP chat. | `OCP_CHAT_COUNT` | Counts each OCP camper's chat assignments across the bundle. |
| OCP chats must occur in C–E. | `OCP_CHAT_WRONG_BLOCK` | Checks each chat assignment's block ID against C, D, and E. |

First-bundle OCP swim is mandatory. Afterward, only levels 4–5 may opt out; a lower-level camper's opt-out flag does not waive swim.

### Night checks

Implemented in [`validateNightSchedule.ts`](../src/features/scheduling/validation/validateNightSchedule.ts).

| Requirement / description | Issue code | How it is verified |
| --- | --- | --- |
| Scheduled night workers must exist. | `NIGHT_UNKNOWN_ASSIGNEE` | Looks up every assigned person in the attendee map. |
| Scheduled night bunks must exist. | `NIGHT_UNKNOWN_BUNK` | Compares scheduled bunk numbers with the session's bunk list. |
| A person cannot hold multiple night assignments. | `NIGHT_COLLISION` | Builds a person-to-slot map across all bunks and positions and flags multiple slots. |
| Staff/admin cannot work on their day off. | `NIGHT_SCHEDULED_ON_DAY_OFF` | Checks assigned people against their day-off dates and the session's recognized day-off dates. |
| Counselors on duty cannot have the following day off. | `NIGHT_COD_BEFORE_DAY_OFF` | Checks the next calendar day against each on-duty counselor's day-off schedule. |
| Every available staff member needs a night assignment. | `NIGHT_UNACCOUNTED` | Flags staff with no night slot who are not on a day off. Unassigned admins are allowed. |
| Every bunk needs sufficient night coverage. | `NIGHT_UNDERSTAFFED` | Requires at least two counselors on duty and two on night bunk duty. Checks omitted bunks too. |

Night coverage excludes unknown people, campers, duplicates, and people on a day off. There is no minimum rover count. Collisions produce a separate error. The general `INVALID_SCHEDULE`, `WRONG_ASSIGNMENT_LIST`, and `DUPLICATE_ASSIGNMENT` checks also apply at night. Night structure validation requires a valid Moment date, numeric bunk keys, and integer arrays for all three positions.