// src/types/api.ts

export interface User {
    id: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    // Only populated by GET /api/v1/profile — every other UserOut response leaves these null.
    company_name?: string | null;
    is_own_company?: boolean | null;
}

export interface TimeEntry {
    id: number;
    activity_name: string;
    // Raw ISO 8601 datetime — format for display on the client (see HistoryTable.tsx).
    activity_date: string;
    activity_hours: number;
    // Serialized as a JSON string by the backend (Decimal), not a number.
    rate_hour: string;
    time_start: string;
    time_end: string;
}

export interface HourlyRate {
    activity_id: number;
    activity_name: string;
    // Serialized as a JSON string by the backend (Decimal), not a number.
    hourly_rate_gross: string;
}

export interface DashboardData {
    total_hours: number;
    // Serialized as a JSON string by the backend (Decimal), not a number.
    total_gross_salary: string;
    time_entries: TimeEntry[];
}

export interface IncomingInvitation {
    id: string;
    invited_email: string;
    status: string;
    created_at: string;
    expires_at: string;
    responded_at: string | null;
    manager_name: string;
    company_name: string;
}
