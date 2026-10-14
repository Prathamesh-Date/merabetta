from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, PageBreak, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf' / 'Merabetta-Client-API-Integration-Status.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial', boldItalic='Arial-Bold')
PURPLE = colors.HexColor('#65418A')
ORANGE = colors.HexColor('#F58035')
INK = colors.HexColor('#26324A')
GRAY = colors.HexColor('#607086')
LIGHT = colors.HexColor('#F4F0F8')
BORDER = colors.HexColor('#E2DBEA')
W = A4[0] - 88
styles = {
    'title': ParagraphStyle('title', fontName='Arial-Bold', fontSize=25, leading=30, textColor=INK, spaceAfter=10),
    'h1': ParagraphStyle('h1', fontName='Arial-Bold', fontSize=18, leading=23, textColor=INK, spaceAfter=9),
    'h2': ParagraphStyle('h2', fontName='Arial-Bold', fontSize=12, leading=16, textColor=PURPLE, spaceBefore=12, spaceAfter=6),
    'body': ParagraphStyle('body', fontName='Arial', fontSize=10, leading=14.5, textColor=INK, spaceAfter=7),
    'small': ParagraphStyle('small', fontName='Arial', fontSize=8.5, leading=12, textColor=GRAY, spaceAfter=5),
    'cell': ParagraphStyle('cell', fontName='Arial', fontSize=8.5, leading=11.3, textColor=INK),
    'tiny': ParagraphStyle('tiny', fontName='Arial', fontSize=7.8, leading=10, textColor=INK),
    'head': ParagraphStyle('head', fontName='Arial-Bold', fontSize=8.4, leading=11, textColor=colors.white),
}
def p(text, style='body'):
    return Paragraph(text, styles[style])
def table(rows, widths, compact=False):
    body_style = 'tiny' if compact else 'cell'
    cells = [[p(escape(str(v)), 'head' if i == 0 else body_style) for v in row] for i, row in enumerate(rows)]
    t = Table(cells, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PURPLE), ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8F6FA')]),
        ('LINEBELOW',(0,0),(-1,0),0.5,PURPLE), ('LINEBELOW',(0,1),(-1,-1),0.4,BORDER),
        ('LEFTPADDING',(0,0),(-1,-1),7), ('RIGHTPADDING',(0,0),(-1,-1),7),
        ('TOPPADDING',(0,0),(-1,-1),4 if compact else 6),
        ('BOTTOMPADDING',(0,0),(-1,-1),4 if compact else 6),
    ]))
    return t
def box(text):
    t = Table([[p(text)]], colWidths=[W])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),LIGHT),('BOX',(0,0),(-1,-1),0.5,BORDER),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    return t

groups = [
    ('Authentication',5,5,5,0), ('Customer profile',3,2,2,1), ('Saved addresses',4,3,3,1),
    ('Family / patients',4,3,3,1), ('FAQs',1,1,1,0), ('States / cities',2,2,2,0),
    ('Lab listing',1,1,1,0), ('Redcliffe catalog / dates / slots',4,4,4,0),
    ('Lab bookings / reports',5,5,5,0), ('Product orders / payments',3,3,2,0),
    ('Location services',3,3,3,0), ('Public connectivity ping',1,0,0,1),
    ('Demo products / cart',2,0,0,2), ('Optional lab areas',1,0,0,1), ('Native version policy',1,0,0,1),
]
assert tuple(sum(row[i] for row in groups) for i in range(1,5)) == (40,32,31,8)
endpoints = [
 ('POST','/auth/otp/request','Send mobile OTP'), ('POST','/auth/otp/verify','Verify OTP / receive cookie'),
 ('GET','/auth/me','Restore account / session'), ('POST','/auth/logout','Sign out this session'), ('POST','/auth/logout-all','Sign out all devices'),
 ('PUT','/customers/me/profile','Complete / edit profile'), ('DELETE','/customers/me','Confirmed account deletion'),
 ('POST','/customers/me/addresses','Add saved address'), ('PUT','/customers/me/addresses/:id','Edit saved address'), ('DELETE','/customers/me/addresses/:id','Remove saved address'),
 ('POST','/customers/me/family-members','Add patient / family member'), ('PUT','/customers/me/family-members/:id','Edit patient / member'), ('DELETE','/customers/me/family-members/:id','Remove patient / member'),
 ('GET','/faqs','Display FAQs'), ('GET','/states','State dropdown'), ('GET','/states/:stateId/cities','City dropdown'),
 ('GET','/labs/lablisting','Active labs / pagination'), ('GET','/redcliffe/catalog','Tests, prices and categories'),
 ('GET','/redcliffe/packages/:code/parameters','Included test parameters'), ('GET','/redcliffe/dates','India collection dates'), ('GET','/redcliffe/slots','Available collection slots'),
 ('GET','/lab-bookings','Booking history / statuses'), ('POST','/lab-bookings','Submit lab booking'),
 ('POST','/lab-bookings/:id/cancel','Cancellation with reason'), ('POST','/lab-bookings/:id/amend','Change tests / patient'),
 ('GET','/lab-bookings/:id/reports/:reportId','Authenticated PDF report'),
 ('GET','/orders','Product order history'), ('GET','/orders/:id','Verify payment on backend'), ('POST','/orders','Create product order - DISABLED'),
 ('GET','/locations/search','Search address / location'), ('GET','/locations/reverse','Coordinates to address'), ('GET','/locations/map','Selected-location map'),
]
assert len(endpoints) == 32

story = []
story += [p('WEBSITE DEVELOPMENT STATUS', 'small'), p('Merabetta<br/>API Integration', 'title'), p('Client briefing | 14 October 2026 | Current local development status', 'small'), Spacer(1,12)]
story += [box('<b>Current position:</b> Backend URL is configured and the connection is verified. Integration code covers <b>32 customer API operations</b>. Of these, <b>31 are connected to website flows</b> and <b>1 product checkout operation is disabled</b> until the catalog is confirmed. Full customer/provider acceptance testing remains pending.'), Spacer(1,14)]
stats = [['32','31','1','8'],['Operations coded','Website flows enabled','Checkout API disabled','Not used by design']]
t = Table([[p('<b>'+v+'</b>', 'h1') for v in stats[0]], [p(v, 'small') for v in stats[1]]], colWidths=[W/4]*4)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#FAF8FC')),('LEFTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,0),10),('BOTTOMPADDING',(0,1),(-1,1),10)]))
story += [t, p('What has been implemented', 'h2')]
for text in [
 '<b>Account access:</b> Mobile OTP sign-in, resend/expiry timers, cookie-based session restore, onboarding, logout and account deletion.',
 '<b>Customer care details:</b> Profile updates, saved address management, family/patient management, state/city selection and location lookup.',
 '<b>Lab journey:</b> Lab and test catalog, category filters, included parameters, collection dates/slots, booking, history, cancellation, amendment and report download actions.',
 '<b>Checkout safeguards:</b> Duplicate-submit protection, stable retry identifier, pending-state handling and server-based payment checks. Personal account/patient data is not persisted in browser localStorage.',
]: story.append(p(text))
story += [p('Client ko bolne ke liye', 'h2'),box('"Humne website ko backend se connect kar diya hai aur 32 API operations ka code integrate kiya hai. 31 website flows enabled hain. Product order creation catalog confirmation tak disabled hai. Build aur automated tests pass hain; real OTP, booking, reports aur payment ki live testing abhi baaki hai."')]
story += [p('Counting rule: one HTTP method + one route = one API operation. GET and POST on the same URL count separately. Enabled means wired into the UI, not proven live with a customer account.', 'small'), PageBreak()]

story += [p('API coverage and what is remaining', 'h1'), p('The handoff documents contain 40 customer operations under /api/app. The five additional health/payment operations are reported separately.', 'body')]
rows = [['Module','Total','Coded','Enabled','Not used']] + [[*r] for r in groups] + [['TOTAL',40,32,31,8]]
story += [table(rows,[W-206,55,49,51,51],True),p('Why 8 customer operations are not called', 'h2')]
excluded = [
 ('GET /customers/me; GET /customers/me/addresses; GET /customers/me/family-members','3','The /auth/me account response already contains profile, addresses and members.'),
 ('GET /products; GET /cart','2','Demo data only. The website keeps its cart locally; production product data is not supplied.'),
 ('GET /public','1','Used for connectivity checks only, not a website feature.'),
 ('GET /lab-areas','1','Optional area lookup. Current checkout uses selected coordinates and slot serviceability.'),
 ('GET /version-policy','1','Android/iOS build policy; not needed for website updates.'),
]
story += [table([['Operation(s)','#','Reason']]+excluded,[210,35,W-245],True),Spacer(1,9),box('<b>Remaining API activation:</b> 1 operation - <b>POST /orders</b>. Its code is present, but the active product catalog must be confirmed before enabling checkout. The 8 operations above are not eight unfinished mandatory integrations. Additional integration is needed only if the agreed scope/data source changes.')]
story += [p('All 32 coded operations still need customer/provider acceptance verification beyond the limited live connectivity checks. No real booking or payment has been completed in this work.', 'small'), PageBreak()]

story += [p('The 32 coded API operations', 'h1'),p('Prefix for every path below: /api/app. Route placeholders (:id, :code) are actual backend IDs supplied at runtime. All rows are connected to UI actions; row 29 is conditional and currently disabled.', 'small')]
story += [table([['#','Method','Route','Website purpose']]+[[i,m,path,purpose] for i,(m,path,purpose) in enumerate(endpoints,1)],[30,52,238,W-320],True),Spacer(1,8),p('Report download is shown when the booking response contains report IDs. Authenticated response/provider metadata must still be confirmed in live testing.', 'small'),PageBreak()]

story += [p('Verification, dependencies and next steps', 'h1'),p('What has been verified', 'h2')]
for text in [
 '<b>Production build and TypeScript:</b> Passed; all 21 pages generated successfully.',
 '<b>Automated API tests:</b> 10 passed. Covered cookie credentials, OTP versus session 401 handling, 204 responses, validation, pending responses, network failures and payload normalization.',
 '<b>Mocked browser flow:</b> Passed wrong/correct OTP, profile display, category filtering, available slots, slot reset, 202 pending booking, private-data storage checks, reload recovery and identical-body retry after history review. Layout checked at 390px and 1440px.',
 '<b>Live HTTP checks:</b> Health live/ready, public ping, FAQs, states and demo products returned 200. /auth/me without a cookie returned the expected 401. These are 7 distinct read-only operations, not seven completed customer journeys.',
 '<b>Website connection:</b> Fixed API proxy returned real backend responses. Localhost:3000 CORS preflight allowed credentials. The website profile, labs and cart pages returned 200.',
]: story.append(p(text))
story += [p('What remains before client acceptance / launch', 'h2')]
todo = [
 ('Real account testing','Verify received OTP, cookie persistence/reload, new/existing profiles, address and family mutations, logout/delete.','Frontend + test customer'),
 ('Lab provider testing','Confirm live catalog, serviceable pin, slots, booking 201/202, cancellation/amendment and actual report download.','Frontend + backend/provider'),
 ('Product catalog / checkout','Confirm the production catalog and matching product IDs; then enable POST /orders and test HDFC payment verification.','Backend catalog + frontend'),
 ('Web payment return','Implement/agree a website return experience. Current handoff describes a mobile-app deep link.','Backend/payment team'),
 ('Production configuration','Set hosting API configuration, allow the deployed website origin, and use HTTPS to the backend. Verify cookies on the deployed site.','Hosting + backend + frontend'),
]
story += [table([['Remaining work','Required action','Owner']]+todo,[102,283,W-385],True)]
story += [p('Additional APIs outside the customer count', 'h2'),p('GET /health/live and GET /health/ready were checked. POST /api/payments/hdfc/webhook is gateway-to-backend; the website must not call it. GET and POST /api/payments/hdfc/return are backend payment-return handling. These five operations bring the documented total to 45, but are not five missing frontend integrations.', 'small')]
story += [box('<b>Delivery status:</b> Ready for customer/provider verification in local development. Product checkout activation, website payment return and production setup remain pending. This report does not claim deployment, a successful real booking or a successful payment.')]
story += [p('Basis: developer handoff documents dated 11 October 2026; current customer API client and website call sites; recorded build, automated/browser tests and read-only live checks on 14 October 2026. API origin configured locally: http://16.4.61.3:3000.', 'small')]

def decorate(c, doc):
    c.setFillColor(PURPLE); c.rect(0,A4[1]-8,A4[0],8,fill=1,stroke=0)
    c.setFont('Arial-Bold',9); c.setFillColor(PURPLE); c.drawString(44,A4[1]-32,'MERABETTA')
    c.setFont('Arial',8); c.setFillColor(GRAY); c.drawRightString(A4[0]-44,A4[1]-32,'Website API status | 14 October 2026')
    c.setStrokeColor(BORDER); c.line(44,40,A4[0]-44,40)
    c.setFont('Arial',8); c.drawString(44,26,'Client briefing | Code integration and live verification are separate')
    c.drawRightString(A4[0]-44,26,f'{doc.page}')

doc = SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=52,bottomMargin=52,title='Merabetta Website API Integration - Client Status',author='Merabetta Web Development',allowSplitting=1)
doc.build(story,onFirstPage=decorate,onLaterPages=decorate)
reader = PdfReader(str(OUT))
print('PDF:',OUT)
print('Pages:',len(reader.pages))
assert len(reader.pages)==4, f'Unexpected pagination: {len(reader.pages)}'
text = '\n'.join(page.extract_text() for page in reader.pages)
assert '32' in text and 'POST /orders' in text and '31' in text
assert '\ufffd' not in text
for i,page in enumerate(reader.pages,1): print(f'Page {i}: {len(page.extract_text())} text characters')
