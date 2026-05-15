function formatPhone(phone: string): string {
  // Normalize to 255XXXXXXXXX format for Beem Africa
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('255')) return digits
  if (digits.startsWith('0')) return '255' + digits.slice(1)
  if (digits.startsWith('7') || digits.startsWith('6')) return '255' + digits
  return digits
}

export async function sendApprovalSMS(phone: string, fullName: string, code: string) {
  const apiKey = process.env.BEEM_API_KEY
  const secretKey = process.env.BEEM_SECRET_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (!apiKey || !secretKey) {
    console.warn('Beem Africa credentials hazipo — SMS haitumwi')
    return
  }

  const message =
    `Habari ${fullName}! Ombi lako la MaliPamoja limeidhinishwa. ` +
    `Code yako: ${code}. ` +
    `Ingia: ${appUrl}/login chagua Mwanachama.`

  const body = {
    source_addr: 'MaliPamoja',
    schedule_time: '',
    encoding: 0,
    message,
    recipients: [{ recipient_id: 1, dest_addr: formatPhone(phone) }],
  }

  const res = await fetch('https://apisms.beem.africa/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${apiKey}:${secretKey}`).toString('base64'),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Beem SMS failed: ${res.status} ${text}`)
  }
}
