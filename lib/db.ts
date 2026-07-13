import { neon } from '@neondatabase/serverless'

// Neon serverless (HTTP) client. Use the tagged template for parameterised
// queries, e.g.  const rows = await sql`select * from profiles where id = ${id}`
export const sql = neon(process.env.DATABASE_URL!)
