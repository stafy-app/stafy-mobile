// src/utils/pieChartHelper.ts

import {TimeEntry} from "@/src/types/api";

export default function pieChartHelper(timeEntries: TimeEntry[], timeTotal: number) {
    const { categoryMap, finalTotalMinutes } = calculateTotalTimePerActivity(timeEntries, timeTotal);
    return formatChartData(categoryMap, finalTotalMinutes);
}


function calculateTotalTimePerActivity(timeEntries: TimeEntry[], timeTotal: number) {
    const categoryMap: Record<string, number> = {};

    let totalMinutesForChart = 0;

    timeEntries.forEach(entry => {
        const start = new Date(entry.time_start);
        const end = new Date(entry.time_end);

        const diffInMilliseconds = end.getTime() - start.getTime();
        const diffInMinutes = diffInMilliseconds / (1000 * 60);

        totalMinutesForChart += diffInMinutes;

        if (!categoryMap[entry.activity_name]) {
            categoryMap[entry.activity_name] = 0;
        }
        categoryMap[entry.activity_name] += diffInMinutes;
    });

    return { categoryMap, finalTotalMinutes: totalMinutesForChart };
}


function formatChartData(categoryMap: Record<string, number>, totalMinutes: number) {
    const chartData = Object.keys(categoryMap).map(activity_name => {
        const mins = categoryMap[activity_name];

        const percentage = totalMinutes > 0
            ? Math.round((mins / totalMinutes) * 100)
            : 0;

        // Map the colors to specific activities
        let color = "#cbd5e1";
        if (activity_name === "Course") color = "#ea580c";
        if (activity_name === "Meeting") color = "#1e293b";
        if (activity_name === "Demo") color = "#94a3b8";

        return {
            activity: activity_name,
            percentage,
            color
        };
    });

    return chartData.sort((a, b) => b.percentage - a.percentage);
}
