export type AssignmentStatus = 'active' | 'released' | 'written_off'

export interface Assignment {
    id: string
    asset_id: string
    asset_code: string
    asset_description: string
    responsible_name: string | null
    responsible_position: string | null
    assigned_at: string
    deactivated_at: string | null
    deactivation_reason: string | null
    status: AssignmentStatus
    created_by_name: string
    created_at: string
}

export interface CreateAssignmentRequest {
    asset_id: string
    responsible_name?: string
    responsible_position?: string
    assigned_at: string
}

export interface ReleaseAssignmentRequest {
    deactivated_at: string
    deactivation_reason?: string
}

export interface StatusHistory {
    id: string
    asset_id: string
    previous_status: string | null
    new_status: string
    notes: string | null
    recorded_by: string
    created_at: string
}
