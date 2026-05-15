import { createAdminClient } from '@/lib/supabase/admin'
import { JoinForm } from '@/components/join/JoinForm'

export const metadata = { title: 'Omba Kujiunga — MaliPamoja' }

export default async function JoinPage() {
  const admin = createAdminClient()
  const { data: groups } = await admin
    .from('groups')
    .select('id, name, description, contribution_amount, contribution_cycle')
    .order('created_at', { ascending: true })

  return <JoinForm groups={groups ?? []} />
}
