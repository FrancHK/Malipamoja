import twilio from 'twilio'

export async function sendWhatsAppApproval(phone: string, fullName: string, code: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const message =
    `Habari ${fullName}! 🎉\n\n` +
    `Ombi lako la kujiunga na MaliPamoja limeidhinishwa.\n\n` +
    `Code yako ya kuingia ni: *${code}*\n\n` +
    `Tembelea: ${appUrl}/login\n` +
    `Chagua "Mwanachama" kisha ingiza code yako.\n\n` +
    `Karibuni sana! 🏦`

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  const to = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to,
    body: message,
  })
}
