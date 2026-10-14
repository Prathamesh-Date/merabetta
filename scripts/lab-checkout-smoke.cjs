// All customer and booking responses are mocked. No real booking is submitted.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const address = { id:'address-1', line1:'Test home', city:'Pune', state:'Maharashtra', postalCode:'411045', location:{ provider:'locationiq', placeId:'fixture', displayName:'Pune, India', latitude:18.56, longitude:73.78, address:{ city:'Pune' } } };
const account = { user:{ id:'lab-wizard-fixture', name:'Test Customer', profileCompleted:true }, identities:[], addresses:[address], members:[] };
const lab = { id:'redcliffe:wizard', name:'HBA1C Test', packageCode:'WIZARD', labName:'Redcliffe Labs', price:299, mrp:499, available:true };
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  let failSlots=true, booking, memberPost, memberPut;
  await page.route('**/api/app/**', async route => {
   const url=new URL(route.request().url()), path=url.pathname.replace('/api/app',''), method=route.request().method();
   let data, status=200;
   if(path==='/auth/me') data=account;
   else if(path==='/redcliffe/catalog') data={data:[lab]};
   else if(path==='/redcliffe/dates') data={dates:['2026-10-15','2026-10-16'],timeZone:'Asia/Kolkata'};
   else if(path==='/redcliffe/slots') { if(failSlots){status=503;data={error:'Collection service unavailable. Please retry.'};}else data={serviceable:true,message:'',slots:[{id:'blocked',label:'8:00 AM',available:false},{id:'slot-'+url.searchParams.get('collectionDate'),label:'9:00 AM',available:true}]}; }
   else if(path.startsWith('/customers/me/family-members')) {
    const body=route.request().postDataJSON();
    if(method==='POST'){memberPost=body;account.members.push({...body,id:'member-1'});}else {memberPut=body;account.members=[{...body,id:'member-1'}];}
    data=account;
   } else if(path==='/states') data={data:[{id:'mh',name:'Maharashtra'}]};
   else if(path.startsWith('/states/')) data={data:[{id:'pune',name:'Pune'}]};
   else if(path==='/locations/map') data={uri:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'};
   else if(path==='/lab-bookings'&&method==='POST'){booking=route.request().postDataJSON();status=201;data={id:'booking-1',status:'Confirmed'};}
   else {status=404;data={error:'Unmocked API'};}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.addInitScript(() => localStorage.setItem('merabetta-web-v2',JSON.stringify({cart:{'redcliffe:wizard':1,p1:1},wishlist:[],coupon:false})));
  await page.goto('http://localhost:3000/cart');
  const main=page.locator('main'), button=(name)=>main.getByRole('button',{name,exact:true});
  await main.getByLabel('Cart sections').getByRole('button',{name:'Labs',exact:true}).click();
  await button('Proceed to checkout - Rs. 299').click();
  assert.equal(await button('Book lab collection').isDisabled(),true);
  await main.getByRole('heading',{name:'Your selected tests'}).waitFor();
  fs.mkdirSync('artifacts/lab-checkout',{recursive:true});
  async function layout(stage) {
   for(const width of [1440,900,390,320]){
    await page.setViewportSize({width,height:1000});
    assert.equal(await main.evaluate(el=>['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight),false,stage+' inner page scrollbar');
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,stage+' overflow '+width);
    const boxes=await main.locator('.ca-cart-layout > div, .ca-cart-layout > aside').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom};}));
    assert.equal(await main.locator('.ca-summary').isVisible(),width>=1024,stage+' summary visibility '+width);
    if(width>=1024) assert(boxes[0].right<=boxes[1].left,stage+' overlapping summary '+width);
    await page.screenshot({path:`artifacts/lab-checkout/${stage}-${width}.png`,fullPage:true});
   }
  }
  await layout('tests');
  await button('Continue to family member').click();
  await button('Continue to address & slot').click();
  await main.getByText('Select a saved family member.',{exact:true}).waitFor();
  await button('Add family member').click();
  await main.getByLabel('Full name',{exact:true}).fill('Test Mother');
  await main.getByRole('group',{name:'Relationship',exact:true}).getByRole('button',{name:'Mother',exact:true}).click();
  await main.getByLabel('Birthdate',{exact:true}).fill('1990-01-01');
  await main.getByLabel('Mobile number (optional)',{exact:true}).fill('9767414690');
  await button('Save family member').click();
  await main.getByRole('heading',{name:'Test Mother',exact:true}).waitFor();
  assert.equal(memberPost.relationship,'Mother');
  await button('Edit selected member').click();
  await main.getByLabel('Full name',{exact:true}).fill('Updated Mother');
  await button('Save family member').click();
  await main.getByRole('heading',{name:'Updated Mother',exact:true}).waitFor();
  assert.equal(memberPut.name,'Updated Mother');
  await layout('member');
  await button('Continue to address & slot').click();
  await button('15 October 2026').click();
  await main.getByText('Collection service unavailable. Please retry.',{exact:true}).waitFor();
  await button('Review booking').click();
  assert.equal(booking,undefined);
  failSlots=false;
  await button('16 October 2026').click();
  await button('9:00 AM').waitFor();
  await button('15 October 2026').click();
  await button('9:00 AM').waitFor();
  assert.equal(await button('8:00 AM · Unavailable').isDisabled(),true);
  await button('9:00 AM').click();
  await button('16 October 2026').click();
  await page.waitForFunction(()=>document.querySelector('[aria-label="Collection time"] button:not(:disabled)')?.getAttribute('aria-pressed')==='false');
  await button('Review booking').click();
  assert.equal(await main.getByRole('heading',{name:'Review your booking',exact:true}).count(),0);
  await button('9:00 AM').click();
  await main.getByLabel('Delivery notes (optional)',{exact:true}).fill('Call on arrival');
  await layout('visit');
  await button('Review booking').click();
  await main.getByRole('heading',{name:'Review your booking',exact:true}).waitFor();
  await layout('review');
  await button('Confirm booking').click();
  await main.getByRole('heading',{name:/Booking status: Confirmed/}).waitFor();
  assert.deepEqual(booking.items,[{id:lab.id,quantity:1}]);
  assert.equal(booking.memberId,'member-1');assert.equal(booking.slotId,'slot-2026-10-16');assert.equal(booking.notes,'Call on arrival');
  assert.equal(booking.address.location.latitude,18.56);assert(booking.requestKey);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('merabetta-web-v2')).cart.p1===1&&!JSON.parse(localStorage.getItem('merabetta-web-v2')).cart['redcliffe:wizard']);
  console.log('PASS: four steps, member POST/PUT, saved address, slot failure/retry/unavailable/date invalidation, review payload, isolated cart and responsive layouts.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
