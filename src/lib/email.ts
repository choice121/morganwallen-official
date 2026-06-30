/**
 * Email helper — calls the send-email Supabase Edge Function.
 * All emails flow through Gmail SMTP via the deployed Edge Function.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SITE_SECRET = import.meta.env.VITE_SITE_CALL_SECRET as string | undefined

const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/send-email`

interface EmailPayload {
  type: 'newsletter_confirm' | 'welcome' | 'contact_notify' | 'contact_auto_reply'
  name?: string
  to?: string
  subject?: string
  message?: string
  contactType?: string
}

async function callEmailFn(payload: EmailPayload): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (SITE_SECRET) {
    headers['x-site-secret'] = SITE_SECRET
  }

  const resp = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const err = await resp.text().catch(() => resp.statusText)
    console.error('[email] Edge function error:', resp.status, err)
    // Non-fatal — don't throw, just log. DB record is already saved.
  }
}

/** Sent to a new newsletter subscriber. */
export async function sendNewsletterConfirm(email: string, name?: string): Promise<void> {
  await callEmailFn({ type: 'newsletter_confirm', to: email, name: name || '' })
}

/** Sent to site owner when a contact form is submitted. */
export async function sendContactNotify(
  name: string,
  email: string,
  subject: string,
  message: string,
  contactType: string,
): Promise<void> {
  await callEmailFn({ type: 'contact_notify', name, to: email, subject, message, contactType })
}

/** Auto-reply sent to the person who submitted a contact form. */
export async function sendContactAutoReply(name: string, email: string): Promise<void> {
  await callEmailFn({ type: 'contact_auto_reply', name, to: email })
}

/** Welcome email sent after account creation. */
export async function sendWelcome(name: string, email: string): Promise<void> {
  await callEmailFn({ type: 'welcome', name, to: email })
}
