import type { Group, GroupMember, Contribution, Loan, Transaction, DashboardStats } from './types'

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Umoja Savings Group',
    description: 'Kundi la akiba la familia na marafiki wa karibu',
    contribution_amount: 50000,
    contribution_cycle: 'monthly',
    interest_rate: 10,
    max_loan_multiplier: 3,
    created_by: 'u1',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
    member_count: 12,
    total_savings: 3600000,
    active_loans: 3,
    my_role: 'admin',
  },
  {
    id: 'g2',
    name: 'Maendeleo Investment Club',
    description: 'Kundi la uwekezaji kwa maendeleo ya biashara',
    contribution_amount: 100000,
    contribution_cycle: 'monthly',
    interest_rate: 12,
    max_loan_multiplier: 5,
    created_by: 'u1',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
    member_count: 8,
    total_savings: 4800000,
    active_loans: 2,
    my_role: 'treasurer',
  },
  {
    id: 'g3',
    name: 'Mwanzo Youth Fund',
    description: 'Vijana wanaofanya kazi pamoja kwa mustakabali bora',
    contribution_amount: 20000,
    contribution_cycle: 'weekly',
    interest_rate: 8,
    max_loan_multiplier: 3,
    created_by: 'u2',
    created_at: '2024-06-01T08:00:00Z',
    updated_at: '2024-06-01T08:00:00Z',
    member_count: 20,
    total_savings: 1600000,
    active_loans: 5,
    my_role: 'member',
  },
]

export const MOCK_MEMBERS: GroupMember[] = [
  {
    id: 'm1', group_id: 'g1', user_id: 'u1', role: 'admin',
    joined_at: '2024-01-15T08:00:00Z', is_active: true,
    profile: { id: 'u1', full_name: 'Amina Johari', phone: '+255 712 345 678', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
    total_contributions: 600000, pending_contributions: 0,
  },
  {
    id: 'm2', group_id: 'g1', user_id: 'u2', role: 'treasurer',
    joined_at: '2024-01-15T08:00:00Z', is_active: true,
    profile: { id: 'u2', full_name: 'Hassan Mwalimu', phone: '+255 754 987 321', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
    total_contributions: 550000, pending_contributions: 50000,
  },
  {
    id: 'm3', group_id: 'g1', user_id: 'u3', role: 'member',
    joined_at: '2024-02-01T08:00:00Z', is_active: true,
    profile: { id: 'u3', full_name: 'Fatuma Said', phone: '+255 763 111 222', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
    total_contributions: 500000, pending_contributions: 0,
  },
  {
    id: 'm4', group_id: 'g1', user_id: 'u4', role: 'member',
    joined_at: '2024-02-15T08:00:00Z', is_active: true,
    profile: { id: 'u4', full_name: 'Juma Kimani', phone: '+255 719 444 555', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
    total_contributions: 450000, pending_contributions: 50000,
  },
  {
    id: 'm5', group_id: 'g1', user_id: 'u5', role: 'member',
    joined_at: '2024-03-01T08:00:00Z', is_active: true,
    profile: { id: 'u5', full_name: 'Zainab Rashid', phone: '+255 748 666 777', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
    total_contributions: 400000, pending_contributions: 0,
  },
  {
    id: 'm6', group_id: 'g1', user_id: 'u6', role: 'member',
    joined_at: '2024-03-15T08:00:00Z', is_active: true,
    profile: { id: 'u6', full_name: 'Ibrahim Ally', phone: '+255 722 888 999', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
    total_contributions: 350000, pending_contributions: 50000,
  },
]

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  { id: 'c1', group_id: 'g1', member_id: 'u1', amount: 50000, period_start: '2025-05-01', period_end: '2025-05-31', status: 'paid', paid_at: '2025-05-02T10:00:00Z', recorded_by: 'u2', notes: null, created_at: '2025-05-01T00:00:00Z', member: { id: 'u1', full_name: 'Amina Johari', phone: '+255 712 345 678', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' } },
  { id: 'c2', group_id: 'g1', member_id: 'u2', amount: 50000, period_start: '2025-05-01', period_end: '2025-05-31', status: 'pending', paid_at: null, recorded_by: null, notes: null, created_at: '2025-05-01T00:00:00Z', member: { id: 'u2', full_name: 'Hassan Mwalimu', phone: '+255 754 987 321', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' } },
  { id: 'c3', group_id: 'g1', member_id: 'u3', amount: 50000, period_start: '2025-05-01', period_end: '2025-05-31', status: 'paid', paid_at: '2025-05-01T14:00:00Z', recorded_by: 'u2', notes: null, created_at: '2025-05-01T00:00:00Z', member: { id: 'u3', full_name: 'Fatuma Said', phone: '+255 763 111 222', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' } },
  { id: 'c4', group_id: 'g1', member_id: 'u4', amount: 50000, period_start: '2025-05-01', period_end: '2025-05-31', status: 'late', paid_at: null, recorded_by: null, notes: 'Hakulipa kwa wakati', created_at: '2025-05-01T00:00:00Z', member: { id: 'u4', full_name: 'Juma Kimani', phone: '+255 719 444 555', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' } },
  { id: 'c5', group_id: 'g1', member_id: 'u5', amount: 50000, period_start: '2025-05-01', period_end: '2025-05-31', status: 'paid', paid_at: '2025-05-03T09:00:00Z', recorded_by: 'u2', notes: null, created_at: '2025-05-01T00:00:00Z', member: { id: 'u5', full_name: 'Zainab Rashid', phone: '+255 748 666 777', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' } },
  { id: 'c6', group_id: 'g1', member_id: 'u6', amount: 50000, period_start: '2025-05-01', period_end: '2025-05-31', status: 'pending', paid_at: null, recorded_by: null, notes: null, created_at: '2025-05-01T00:00:00Z', member: { id: 'u6', full_name: 'Ibrahim Ally', phone: '+255 722 888 999', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' } },
]

export const MOCK_LOANS: Loan[] = [
  {
    id: 'l1', group_id: 'g1', borrower_id: 'u3', amount: 300000, interest_rate: 10,
    duration_months: 3, total_due: 307500, amount_paid: 102500,
    status: 'active', approved_by: 'u1', purpose: 'Biashara ya chakula',
    requested_at: '2025-04-01T08:00:00Z', approved_at: '2025-04-02T10:00:00Z',
    due_date: '2025-07-02', created_at: '2025-04-01T08:00:00Z',
    borrower: { id: 'u3', full_name: 'Fatuma Said', phone: '+255 763 111 222', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
  },
  {
    id: 'l2', group_id: 'g1', borrower_id: 'u4', amount: 150000, interest_rate: 10,
    duration_months: 2, total_due: 152500, amount_paid: 0,
    status: 'pending', approved_by: null, purpose: 'Malipo ya shule',
    requested_at: '2025-05-10T08:00:00Z', approved_at: null,
    due_date: null, created_at: '2025-05-10T08:00:00Z',
    borrower: { id: 'u4', full_name: 'Juma Kimani', phone: '+255 719 444 555', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
  },
  {
    id: 'l3', group_id: 'g1', borrower_id: 'u6', amount: 500000, interest_rate: 10,
    duration_months: 6, total_due: 525000, amount_paid: 525000,
    status: 'completed', approved_by: 'u1', purpose: 'Kuimarisha biashara',
    requested_at: '2024-11-01T08:00:00Z', approved_at: '2024-11-02T10:00:00Z',
    due_date: '2025-05-02', created_at: '2024-11-01T08:00:00Z',
    borrower: { id: 'u6', full_name: 'Ibrahim Ally', phone: '+255 722 888 999', avatar_url: null, role: 'mwanachama' as const, member_code: null, created_at: '', updated_at: '' },
  },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', group_id: 'g1', type: 'contribution', amount: 50000, description: 'Mchango wa Mei 2025 - Amina Johari', reference_id: 'c1', performed_by: 'u2', member_id: 'u1', created_at: '2025-05-02T10:00:00Z' },
  { id: 't2', group_id: 'g1', type: 'contribution', amount: 50000, description: 'Mchango wa Mei 2025 - Fatuma Said', reference_id: 'c3', performed_by: 'u2', member_id: 'u3', created_at: '2025-05-01T14:00:00Z' },
  { id: 't3', group_id: 'g1', type: 'repayment', amount: 102500, description: 'Malipo ya mkopo - Fatuma Said', reference_id: 'l1', performed_by: 'u2', member_id: 'u3', created_at: '2025-05-01T11:00:00Z' },
  { id: 't4', group_id: 'g1', type: 'contribution', amount: 50000, description: 'Mchango wa Mei 2025 - Zainab Rashid', reference_id: 'c5', performed_by: 'u2', member_id: 'u5', created_at: '2025-05-03T09:00:00Z' },
  { id: 't5', group_id: 'g1', type: 'loan_disbursement', amount: 300000, description: 'Mkopo uliotolewa - Fatuma Said', reference_id: 'l1', performed_by: 'u1', member_id: 'u3', created_at: '2025-04-02T10:00:00Z' },
]

export const MOCK_STATS: DashboardStats = {
  total_savings: 10000000,
  active_members: 40,
  active_loans: 10,
  pending_contributions: 8,
  total_disbursed: 5250000,
  total_repaid: 3150000,
}
