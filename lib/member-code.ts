import crypto from 'crypto'

export function deriveMemberPassword(code: string): string {
  return crypto
    .createHmac('sha256', process.env.MEMBER_SECRET!)
    .update(code.toUpperCase())
    .digest('hex')
}

export function memberEmail(code: string): string {
  return `${code.toLowerCase()}@member.malipamoja`
}

export function generateCode(fullName: string, sequence: number): string {
  const prefix = fullName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)
    .padEnd(3, 'X')
  return `${prefix}${String(sequence).padStart(3, '0')}`
}
