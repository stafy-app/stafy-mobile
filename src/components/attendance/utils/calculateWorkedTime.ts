// src/components/attendance/utils/calculateWorkedTime.ts

export interface WorkedTimeResult{
    hours: number,
    minutes: number,
    totalHours: number,
    totalMinutes: number,
    formatted: string
}

/**
 * Calculates the exact duration between a start and end time.
 * Automatically handles night shifts (when the end time crosses midnight).
 *
 * @param startTime - The Date object representing the clock-in time.
 * @param stopTime - The Date object representing the clock-out time.
 * @returns An object containing the breakdown of the worked time.
 */
export function calculateWorkedTime (startTime: Date, stopTime: Date): WorkedTimeResult{
    // Calculate the raw difference in milliseconds
    const diffInMilliseconds = stopTime.getTime() - startTime.getTime();

    // Convert directly to total minutes
    let totalMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    // Night shift logic: if the result is negative,
    // it means the end time is on the following day.
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60; // Add 24 hours (1440 minutes) to correct the difference
    }

    // Calculate total hours after night shift correction to ensure accuracy
    const totalHours = totalMinutes / 60;

    // Extract clean hours and remaining minutes for display
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
        hours: hours,
        minutes: minutes,
        totalHours: totalHours,
        totalMinutes: totalMinutes,
        formatted: `${hours}h ${minutes}m`
    };
}
