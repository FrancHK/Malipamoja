export type UserRole = 'admin' | 'treasurer' | 'member'
export type SystemRole = 'mwenyekiti' | 'katibu' | 'mweka_hazina' | 'msimamizi' | 'mwanachama'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type ContributionStatus = 'pending' | 'paid' | 'late'
export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
export type ContributionCycle = 'weekly' | 'monthly'
export type TransactionType = 'contribution' | 'loan_disbursement' | 'repayment' | 'withdrawal' | 'fine'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: SystemRole
  member_code: string | null
  created_at: string
  updated_at: string
}

export interface MemberApplication {
  id: string
  full_name: string
  phone: string
  id_number: string | null
  occupation: string | null
  reason: string | null
  status: ApplicationStatus
  group_id: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  member_code: string | null
  rejection_reason: string | null
  created_at: string
  group?: { name: string } | null
}

export interface Group {
  id: string
  name: string
  description: string | null
  contribution_amount: number
  contribution_cycle: ContributionCycle
  interest_rate: number
  max_loan_multiplier: number
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined fields
  member_count?: number
  total_savings?: number
  active_loans?: number
  my_role?: UserRole
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: UserRole
  joined_at: string
  is_active: boolean
  // Joined fields
  profile?: Profile
  total_contributions?: number
  pending_contributions?: number
  active_loan?: Loan | null
}

export interface Contribution {
  id: string
  group_id: string
  member_id: string
  amount: number
  period_start: string
  period_end: string
  status: ContributionStatus
  paid_at: string | null
  recorded_by: string | null
  notes: string | null
  created_at: string
  // Joined
  member?: Profile
  recorder?: Profile
}

export interface Loan {
  id: string
  group_id: string
  borrower_id: string
  amount: number
  interest_rate: number
  duration_months: number
  total_due: number
  amount_paid: number
  status: LoanStatus
  approved_by: string | null
  purpose: string | null
  requested_at: string
  approved_at: string | null
  due_date: string | null
  created_at: string
  // Joined
  borrower?: Profile
  approver?: Profile
}

export interface Repayment {
  id: string
  loan_id: string
  amount: number
  paid_at: string
  recorded_by: string | null
  notes: string | null
  created_at: string
  // Joined
  recorder?: Profile
}

export interface Transaction {
  id: string
  group_id: string
  type: TransactionType
  amount: number
  description: string | null
  reference_id: string | null
  performed_by: string | null
  member_id: string | null
  created_at: string
  // Joined
  performer?: Profile
  member?: Profile
}

export interface DashboardStats {
  total_savings: number
  active_members: number
  active_loans: number
  pending_contributions: number
  total_disbursed: number
  total_repaid: number
}
