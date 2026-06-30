// src/types/api.ts

export interface User {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
}

export interface TimeEntry {
    id: number;
    activity_name: string;
    activity_date: string;
    activity_hours: number;
    rate_hour: number;
    time_start: string;
    time_end: string;
}

export interface HourlyRate {
    activity_id: number;
    activity_name: string;
    hourly_rate_gross: number;
}

export interface DashboardData {
    total_hours: number;
    total_gross_salary: number;
    time_entries: TimeEntry[];
}
