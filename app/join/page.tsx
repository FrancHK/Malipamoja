import { sql } from '@/lib/db'
import { JoinForm } from '@/components/join/JoinForm'

export const metadata = { title: 'Omba Kujiunga — MaliPamoja' }

export default async function JoinPage() {
  const groups = (await sql`
    select id, name, description, contribution_amount::float8 as contribution_amount, contribution_cycle
    from groups
    order by created_at asc
  `) as { id: string; name: string; description: string | null; contribution_amount: number; contribution_cycle: string }[]

  return <JoinForm groups={groups} />
}
