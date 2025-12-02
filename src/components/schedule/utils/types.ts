export type ScheduleEntry = {
    id: string;
    name: string;
    blockA: string;
    blockB: string;
    blockC: string;
    blockD: string;
    blockE: string;
    health?: string;
    apo?: string;
    amPmFreeplay?: string;
    freeplayAssignment?: string;
};

export type ViewMode = 'camper' | 'staff';
