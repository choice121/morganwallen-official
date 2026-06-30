const GMAIL = Deno.env.get('GMAIL_ADDRESS') ?? ''
  const GMAIL_PASS = Deno.env.get('GMAIL_APP_PASSWORD') ?? ''
  const SITE_URL = 'https://morganwallenofficial.pages.dev'
  const GOLD = '#C9A84C'; const DARK = '#0A0A0A'; const BG = '#111111'
  const CREAM = '#F5F0E8'; const CREAM_DIM = '#888880'; const BORDER = '#1E1E1E'

  function wrap(preheader, body) {
    return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>' +
      '<body style="margin:0;padding:0;background:' + DARK + ';font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">' +
      '<div style="display:none;max-height:0;overflow:hidden;">' + preheader + '</div>' +
      '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + DARK + ';">' +
      '<tr><td align="center" style="padding:48px 16px 32px;">' +
      '<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">' +
      '<tr><td style="padding:0 0 28px;text-align:center;border-bottom:1px solid ' + BORDER + ';">' +
      '<p style="margin:0;font-family:Georgia,serif;font-size:10px;letter-spacing:8px;color:' + GOLD + ';text-transform:uppercase;">&#9733; &nbsp; Morgan Wallen &nbsp; &#9733;</p>' +
      '<p style="margin:6px 0 0;font-family:Georgia,serif;font-size:28px;color:' + CREAM + ';letter-spacing:4px;font-weight:400;">OFFICIAL</p>' +
      '</td></tr><tr><td style="background:' + BG + ';border:1px solid ' + BORDER + ';border-top:none;padding:48px 48px 40px;">' + body + '</td></tr>' +
      '<tr><td style="padding:28px 40px;text-align:center;">' +
      '<p style="margin:0 0 6px;font-size:10px;color:#333;letter-spacing:4px;text-transform:uppercase;">Morgan Wallen Official</p>' +
      '<p style="margin:0;font-size:11px;"><a href="' + SITE_URL + '" style="color:#444;text-decoration:none;">morganwallen.com</a></p>' +
      '<p style="margin:8px 0 0;font-size:10px;color:#222;">&#169; 2025 Morgan Wallen. All rights reserved.</p>' +
      '</td></tr></table></td></tr></table></body></html>'
  }
  function btn(label, href) { return '<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:' + GOLD + ';"><a href="' + href + '" style="display:inline-block;color:' + DARK + ';padding:14px 36px;text-decoration:none;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:700;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">' + label + '</a></td></tr></table>' }
  function hh(t) { return '<h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:28px;color:' + CREAM + ';font-weight:400;line-height:1.2;">' + t + '</h2>' }
  function eye(t) { return '<p style="margin:0 0 32px;font-size:11px;color:' + GOLD + ';letter-spacing:4px;text-transform:uppercase;">' + t + '</p>' }
  function pp(t, mb) { return '<p style="margin:0 0 ' + (mb||'20px') + ';font-size:15px;color:' + CREAM_DIM + ';line-height:1.8;">' + t + '</p>' }

  function tplNewsletter(name) {
    var f = (name||'').split(' ')[0]||'Friend'
    var b = hh("You're on the list.") + eye('Welcome to the fan club') + pp('Hey '+f+',') +
      pp("Thanks for subscribing. You'll be first to know about new music, tour dates, exclusive merch drops, and everything in between.") +
      pp('Big thanks from Morgan and the team.','36px') + btn('Visit the Site', SITE_URL) +
      '<p style="margin:32px 0 0;font-size:11px;color:#333;border-top:1px solid '+BORDER+';padding-top:20px;">You subscribed at morganwallen.com</p>'
    return { subject: "You're on the list — Morgan Wallen", html: wrap(f+", you're officially on the list!", b) }
  }
  function tplWelcome(name) {
    var f = (name||'').split(' ')[0]||'there'
    var b = hh('Welcome to the fan hub.') + eye('Your account is ready') + pp('Hey '+f+',') +
      pp('Your Morgan Wallen fan account is ready. Access exclusive content, early tour announcements, and more coming soon.') +
      pp('Glad to have you here.','36px') + btn('Sign In', SITE_URL+'/login')
    return { subject: 'Welcome to Morgan Wallen Fan Hub', html: wrap(f+', your account is set up.', b) }
  }
  function tplContactNotify(name, email, subj, msg, type) {
    var n = name||'Anonymous'
    var rows = [['From',n],['Email',email],['Type',type||'General'],['Subject',subj||'(no subject)']]
      .map(function(r){ return '<tr><td style="padding:10px 16px 10px 0;border-bottom:1px solid '+BORDER+';font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;">'+r[0]+'</td><td style="padding:10px 0;border-bottom:1px solid '+BORDER+';font-size:14px;color:'+CREAM+';">'+r[1]+'</td></tr>' }).join('')
    var b = hh('New Contact Message') + eye('Via website contact form') +
      '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">'+rows+'</table>' +
      '<div style="background:#0D0D0D;border:1px solid '+BORDER+';border-left:3px solid '+GOLD+';padding:24px;margin:0 0 32px;">' +
      '<p style="margin:0;font-size:14px;color:#999;line-height:1.9;white-space:pre-wrap;">'+(msg||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</p></div>' +
      btn('Reply to '+n, 'mailto:'+email+'?subject=Re: '+encodeURIComponent(subj||''))
    return { subject: 'New message from '+n+' — Morgan Wallen Site', html: wrap(n+' sent a contact form message', b) }
  }
  function tplAutoReply(name) {
    var f = (name||'').split(' ')[0]||'there'
    var b = hh('Message received.') + eye("We'll be in touch") + pp('Hey '+f+',') +
      pp("Thanks for reaching out. Your message has been received and the team will get back to you as soon as possible.") +
      pp('In the meantime, check out the latest on the site.','36px') + btn('Visit the Site', SITE_URL)
    return { subject: 'Thanks for reaching out — Morgan Wallen', html: wrap(f+', we got your message.', b) }
  }

  Deno.serve(async (req) => {
    var cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type' }
    if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
    try {
      var payload = await req.json()
      var type = payload.type
      var name = payload.name||payload.contactName||payload.firstName
      var toAddr = payload.to||payload.contactEmail||''
      var subj = payload.subject||payload.contactSubject||''
      var msg = payload.message||payload.contactMessage||''
      var tpl, recipient = toAddr
      if (type==='newsletter_confirm') { tpl = tplNewsletter(name) }
      else if (type==='welcome') { tpl = tplWelcome(name) }
      else if (type==='contact_notify') { tpl = tplContactNotify(name, toAddr, subj, msg, payload.contactType||'general'); recipient = GMAIL }
      else if (type==='contact_auto_reply') { tpl = tplAutoReply(name) }
      else { return new Response(JSON.stringify({ error: 'Unknown type: '+type }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }) }
      if (!recipient) return new Response(JSON.stringify({ error: 'No recipient' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
      var { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
      var client = new SMTPClient({ connection: { hostname: 'smtp.gmail.com', port: 465, tls: true, auth: { username: GMAIL, password: GMAIL_PASS } } })
      await client.send({ from: '"Morgan Wallen Official" <'+GMAIL+'>', to: recipient, subject: tpl.subject, html: tpl.html })
      await client.close()
      console.log('send-email OK:', type, '->', recipient)
      return new Response(JSON.stringify({ success: true, type, to: recipient }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    } catch(err) {
      console.error('send-email ERR:', String(err))
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
  })