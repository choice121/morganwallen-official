import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-site-secret',
}

const GMAIL = Deno.env.get('GMAIL_ADDRESS') ?? ''
const GMAIL_PASS = Deno.env.get('GMAIL_APP_PASSWORD') ?? ''
const SITE_CALL_SECRET = Deno.env.get('SITE_CALL_SECRET') ?? ''
const SITE_URL = 'https://morganwallenofficial.pages.dev'
const GOLD = '#C9A84C'
const DARK = '#0A0A0A'
const BG = '#111111'
const CREAM_DIM = '#888880'
const BORDER = '#1E1E1E'

function wrap(preheader: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:${DARK};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${DARK};">
  <tr><td align="center" style="padding:48px 16px 32px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr><td style="padding:0 0 28px;text-align:center;border-bottom:1px solid ${BORDER};">
        <p style="margin:0;font-family:Georgia,serif;font-size:10px;letter-spacing:8px;color:${GOLD};text-transform:uppercase;">&#9733; &nbsp; Morgan Wallen &nbsp; &#9733;</p>
        <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:28px;color:#F5F0E8;letter-spacing:4px;font-weight:400;">OFFICIAL</p>
      </td></tr>
      <tr><td style="background:${BG};border:1px solid ${BORDER};border-top:none;padding:48px 48px 40px;">
        ${body}
      </td></tr>
      <tr><td style="padding:28px 40px;text-align:center;">
        <p style="margin:0 0 6px;font-size:10px;color:#333;letter-spacing:4px;text-transform:uppercase;">Morgan Wallen Official</p>
        <p style="margin:0 0 4px;font-size:11px;"><a href="${SITE_URL}" style="color:#444;text-decoration:none;">morganwallen.com</a></p>
        <p style="margin:8px 0 0;font-size:10px;color:#222;">&#169; 2026 Morgan Wallen. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function goldBtn(label: string, href: string) {
  return `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${GOLD};"><a href="${href}" style="display:inline-block;color:${DARK};padding:14px 36px;text-decoration:none;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${label}</a></td></tr></table>`
}

function heading(text: string) {
  return `<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:28px;color:#F5F0E8;font-weight:400;line-height:1.2;">${text}</h2>`
}

function eyebrow(text: string) {
  return `<p style="margin:0 0 32px;font-size:11px;color:${GOLD};letter-spacing:4px;text-transform:uppercase;">${text}</p>`
}

function para(text: string, mb?: string) {
  return `<p style="margin:0 0 ${mb || '20px'};font-size:15px;color:${CREAM_DIM};line-height:1.8;">${text}</p>`
}

// ── Email Templates ───────────────────────────────────────────────────────────

function tplNewsletterConfirm(name: string) {
  const first = (name || '').split(' ')[0] || 'Friend'
  const body = heading("You're on the list.") +
    eyebrow('Welcome to the fan club') +
    para('Hey ' + first + ',') +
    para("Thanks for subscribing to the Morgan Wallen newsletter. You'll be the first to know about new music, exclusive tour announcements, merch drops, and everything going on.") +
    para('Big thanks from Morgan and the whole team. Stay tuned.', '36px') +
    goldBtn('Visit the Site', SITE_URL) +
    `<p style="margin:32px 0 0;font-size:11px;color:#333;border-top:1px solid ${BORDER};padding-top:20px;">You're receiving this because you signed up at morganwallen.com.</p>`
  return {
    subject: "You're on the list \u2014 Morgan Wallen",
    html: wrap(first + ", you're officially on the list!", body),
  }
}

function tplWelcome(name: string) {
  const first = (name || '').split(' ')[0] || 'there'
  const body = heading('Welcome to the fan hub.') +
    eyebrow('Your account is ready') +
    para('Hey ' + first + ',') +
    para("Your Morgan Wallen fan account has been created. You now have full access to everything on the site \u2014 early announcements, exclusive content, and more coming soon.") +
    para('Glad to have you here.', '36px') +
    goldBtn('Sign In to Your Account', SITE_URL + '/login')
  return {
    subject: 'Welcome to Morgan Wallen Fan Hub',
    html: wrap(first + ', your account is set up and ready.', body),
  }
}

function tplContactNotify(name: string, email: string, subj: string, msg: string, type: string) {
  const rows = [
    ['From', name || 'Anonymous'],
    ['Email', '<a href="mailto:' + email + '" style="color:' + GOLD + ';">' + email + '</a>'],
    ['Type', type || 'General'],
    ['Subject', subj || '(no subject)'],
  ].map(function(r) {
    return '<tr><td style="padding:10px 16px 10px 0;border-bottom:1px solid ' + BORDER + ';font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;vertical-align:top;">' + r[0] + '</td><td style="padding:10px 0;border-bottom:1px solid ' + BORDER + ';font-size:14px;color:#F5F0E8;">' + r[1] + '</td></tr>'
  }).join('')

  const body = heading('New Contact Message') +
    eyebrow('Received via website contact form') +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">' + rows + '</table>' +
    '<div style="background:#0D0D0D;border:1px solid ' + BORDER + ';border-left:3px solid ' + GOLD + ';padding:24px;margin:0 0 32px;"><p style="margin:0;font-size:14px;color:#999;line-height:1.9;white-space:pre-wrap;">' + (msg || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p></div>' +
    goldBtn('Reply to ' + name, 'mailto:' + email + '?subject=Re: ' + subj)

  return {
    subject: 'New message from ' + name + ' \u2014 Morgan Wallen Site',
    html: wrap(name + ' sent a message via the contact form', body),
  }
}

function tplContactAutoReply(name: string) {
  const first = (name || '').split(' ')[0] || 'there'
  const body = heading('Message received.') +
    eyebrow("We'll be in touch") +
    para('Hey ' + first + ',') +
    para("Thanks for reaching out. Your message has been received and the team will get back to you as soon as possible.") +
    para('In the meantime, check out the latest music, tour dates, and merch on the site.', '36px') +
    goldBtn('Visit the Site', SITE_URL)
  return {
    subject: 'Thanks for reaching out \u2014 Morgan Wallen',
    html: wrap(first + ', we got your message and will be in touch soon.', body),
  }
}

// ── Request handler ───────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // ── Secret check ─────────────────────────────────────────────────────────
  // If SITE_CALL_SECRET is configured, require callers to pass the matching
  // x-site-secret header. This prevents unauthenticated abuse of the function.
  if (SITE_CALL_SECRET) {
    const provided = req.headers.get('x-site-secret') ?? ''
    if (provided !== SITE_CALL_SECRET) {
      console.warn('[send-email] Rejected: bad or missing x-site-secret')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  try {
    const payload = await req.json()
    const type = payload.type
    const name = payload.name || payload.contactName || payload.firstName
    const toAddr = payload.to || payload.contactEmail || ''
    const subj = payload.subject || payload.contactSubject || ''
    const msg = payload.message || payload.contactMessage || ''
    const contactType = payload.contactType || 'general'

    let tpl: { subject: string; html: string }
    let recipient = toAddr

    if (type === 'newsletter_confirm') {
      tpl = tplNewsletterConfirm(name)
    } else if (type === 'welcome') {
      tpl = tplWelcome(name)
    } else if (type === 'contact_notify') {
      tpl = tplContactNotify(name, toAddr, subj, msg, contactType)
      recipient = GMAIL
    } else if (type === 'contact_auto_reply') {
      tpl = tplContactAutoReply(name)
    } else {
      return new Response(JSON.stringify({ error: 'Unknown type: ' + type }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!recipient) {
      return new Response(JSON.stringify({ error: 'No recipient address' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: { username: GMAIL, password: GMAIL_PASS },
      },
    })
    await client.send({
      from: '"Morgan Wallen Official" <' + GMAIL + '>',
      to: recipient,
      subject: tpl.subject,
      html: tpl.html,
    })
    await client.close()

    console.log('[send-email] OK:', type, '->', recipient)
    return new Response(
      JSON.stringify({ success: true, type: type, to: recipient }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[send-email] ERROR:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
