export const PAIR_SCHEDULE = {
    1: { start: "08:00", end: "09:30" },
    2: { start: "09:40", end: "11:10" },
    3: { start: "11:30", end: "13:00" },
    4: { start: "13:10", end: "14:40" },
    5: { start: "15:00", end: "16:30" },
    6: { start: "16:40", end: "18:10" },
    7: { start: "18:20", end: "19:50" }
} as const;

export type PairNumber = keyof typeof PAIR_SCHEDULE;

export function getPairTime(pairNumber: number): { start: string; end: string } {
    if (pairNumber === undefined || pairNumber === null) {
        console.warn(`[getPairTime] Pair number is undefined/null, using default value 1`);
        pairNumber = 1;
    }
    
    pairNumber = Number(pairNumber);
    
    const pair = PAIR_SCHEDULE[pairNumber as PairNumber];
    if (!pair) {
        console.warn(`[getPairTime] Invalid pair number: ${pairNumber}, using default value 1`);
        return PAIR_SCHEDULE[1];
    }
    return pair;
}

export function getPairTimeWithDate(pairNumber: number, date: Date = new Date()): { startTime: Date; endTime: Date } {
    const pairTime = getPairTime(pairNumber);
    const [startHours, startMinutes] = pairTime.start.split(":").map(Number);
    const [endHours, endMinutes] = pairTime.end.split(":").map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(startHours, startMinutes, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    return { startTime, endTime };
}

export function isValidPairNumber(pairNumber: number): boolean {
    return pairNumber >= 1 && pairNumber <= 7;
}
