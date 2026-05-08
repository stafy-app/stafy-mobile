// src/utils/pieChartHelper.ts


/**
 * Orchestrates the transformation of raw time entries into formatted data for a Pie Chart.
 *
 * This is the primary entry point for chart data processing. It combines two internal processes:
 * 1. Aggregating time from raw entries into activity-based categories.
 * 2. Formatting those categories into a UI-ready structure (adding colors, calculating percentages, and sorting).
 *
 * @param {any[]} timeEntries - An array of raw time entry objects from the database/API.
 * @param {number} timeTotal - The pre-calculated total time in minutes (pass 0 to auto-calculate from entries).
 *
 * @returns {Array<{ activity: string, percentage: number, color: string }>} A sorted array of activity objects ready for pie chart rendering.
 */
export default function pieChartHelper(timeEntries: any[], timeTotal: number) {

    // Calculate the total time spent on each activity
    const { categoryMap, finalTotalMinutes } = calculateTotalTimePerActivity(timeEntries, timeTotal);

    // Format the data for the pie chart
    const formattedData = formatChartData(categoryMap, finalTotalMinutes);

    return formattedData;
}



/**
 * Calculates the total time spent on each activity and determines the cumulative total duration.
 *
 * The function iterates through time entries, calculates the difference between end and start times
 * (in minutes) for each entry, and groups them by activity name. It also calculates a fallback
 * total duration in case the `timeTotal` parameter is not provided or is zero.
 *
 * @param {any[]} timeEntries - An array of objects representing time entries (must contain `time_start`, `time_end`, and `activity_name`).
 * @param {number} timeTotal - A pre-calculated total time (in minutes). If 0, the sum calculated from entries will be used instead.
 *
 * @returns {{ categoryMap: Record<string, number>, finalTotalMinutes: number }} An object containing:
 *   - `categoryMap`: A mapping where keys are activity names and values are the total minutes spent.
 *   - `finalTotalMinutes`: The final total time used for subsequent calculations (e.g., percentages).
 */
function calculateTotalTimePerActivity(timeEntries: any[], timeTotal: number) {
    const categoryMap: Record<string, number> = {};

    let totalMinutesForChart = 0;

    timeEntries.forEach(entry => {
        const start = new Date(entry.time_start);
        const end = new Date(entry.time_end);

        const diffInMilliseconds = end.getTime() - start.getTime();
        const diffInMinutes = diffInMilliseconds / (1000 * 60);

        // Adunăm la totalul graficului
        totalMinutesForChart += diffInMinutes;

        if (!categoryMap[entry.activity_name]) {
            categoryMap[entry.activity_name] = 0;
        }
        categoryMap[entry.activity_name] += diffInMinutes;
    });

    return { categoryMap, finalTotalMinutes: totalMinutesForChart };
}



/**
 * Formats activity data for UI display, including color assignment, percentage calculation, and sorting.
 *
 * This function takes the raw minutes per activity and converts them into a structure compatible
 * with chart components. It handles zero-division safety, maps specific activities to design system
 * colors, and ensures the output is sorted by percentage in descending order.
 *
 * @param {Record<string, number>} categoryMap - A dictionary where keys are activity names and values are minutes spent.
 * @param {number} totalMinutes - The total duration used as a base for percentage calculations.
 *
 * @returns {Array<{ activity: string, percentage: number, color: string }>} A sorted array of formatted objects:
 *   - `activity`: The name of the activity.
 *   - `percentage`: The calculated percentage of the total time (rounded).
 *   - `color`: The HEX color code assigned based on the activity name.
 */
function formatChartData(categoryMap: Record<string, number>, totalMinutes: number) {
    const chartData = Object.keys(categoryMap).map(activity_name => {
        const mins = categoryMap[activity_name];

        // Safety check for division by zero
        const percentage = totalMinutes > 0
            ? Math.round((mins / totalMinutes) * 100)
            : 0;

        // Map the colors to specific activities
        let color = "#cbd5e1"; // Grey by default
        if (activity_name === "Course") color = "#ea580c";
        if (activity_name === "Meeting") color = "#1e293b";
        if (activity_name === "Demo") color = "#94a3b8";

        return {
            activity: activity_name,
            percentage,
            color
        };
    });

    // Sorting descending by percentage
    return chartData.sort((a, b) => b.percentage - a.percentage);
}