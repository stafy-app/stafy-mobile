// src/utils/calculateWorkedTime.ts

export interface WorkedTimeResult {
    hours: number;
    minutes: number;
    totalHours: number;
    totalMinutes: number;
    formatted: string;
}

export function calculateWorkedTime(startTime: Date, stopTime: Date): WorkedTimeResult {
    const diffInMilliseconds = stopTime.getTime() - startTime.getTime();

    let totalMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    // Night shift: if end time crosses midnight, add 24h
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
    }

    const totalHours = totalMinutes / 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
        hours,
        minutes,
        totalHours,
        totalMinutes,
        formatted: `${hours}h ${minutes}m`
    };
}
