// Style and API wiring checks with intercepted fixtures; no real account mutations.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const account = { user: { id:'style-fixture', name:'Style Customer', firstName:'Style', lastName:'Customer', phone:'9876543210', email:'style@example.com', dateOfBirth:'1990-01-01',gender:'Female',profileCompleted:true },identities:[],addresses:[],members:[] };
const tests = Array.from({length:6},(_,i) => ({id:`redcliffe:style-${i}`, packageCode:`style-${i}`, labId:'redcliffe',labName:'Redcliffe Labs',name:`Live Health Package ${i+1}`,parameters:i+1,category:'Full Body',categories:['Full Body','Heart'],price:399+i*100,mrp:899+i*100,available:true,reportTime:'Within 24 hours',sampleType:'Blood',fasting:'Confirm with lab',rating:'4.8'}));
(async()=>{
 const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page = await browser.newPage(); const errors=[]; let loggedIn=false;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/app/**',async route=>{
   const path=new URL(route.request().url()).pathname.replace('/api/app',''); let data; let status=200;
   if(path==='/auth/me'){data=loggedIn?account:{error:'Login required'};status=loggedIn?200:401;}
   else if(path==='/redcliffe/catalog')data={data:tests};
   else if(path==='/labs/lablisting')data={data:[{id:'api-redcliffe-id',name:'Redcliffe Labs',active:true,city:'Pune',homeCollection:true},{id:'orange',name:'Orange Health Labs',active:true,city:'Pune',homeCollection:true}],pagination:{totalPages:1}};
   else if(path.includes('/parameters'))data={data:[{name:'Heart markers',parameters:['Cholesterol','Triglycerides']}]};
   else if(path==='/lab-bookings')data={data:[{id:'fixture-lab-order',kind:'labs',date:'2026-10-14',status:'Pending',paymentStatus:'Payment to Redcliffe',total:399,items:[{...tests[0],quantity:1}],address:{line1:'Fixture address',city:'Pune',postalCode:'411045'}}],statusRefreshFailed:false};
   else if(path==='/orders')data={data:[]};
   else if(path==='/faqs')data={data:[{id:'faq',question:'How do I book?',answer:'Choose a test and an available collection slot.'}]};
   else {status=404;data={error:'Unmocked read'};}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 });
 fs.mkdirSync('artifacts/restored-styles',{recursive:true});
 async function screenshot(name,width){await page.screenshot({path:`artifacts/restored-styles/${name}-${width}.png`,fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} overflow ${width}`);}
 try{
  await page.goto('http://localhost:3000/labtest');
  await page.locator('main .cl-lab-card').first().waitFor();
  assert.equal(await page.locator('main .cl-lab-card').count(),6);assert.equal(await page.locator('main a.cl-lab-card').count(),1);assert.equal(await page.locator('main button.cl-lab-card:disabled').count(),5);
  assert.equal(await page.locator('main a.cl-lab-card').getAttribute('href'),'/labtest?lab=redcliffe');
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1000});
   await page.goto('http://localhost:3000/labtest');await page.locator('main .cl-lab-card').first().waitFor();await screenshot('labs-directory',width);
   await page.goto('http://localhost:3000/profile');await page.locator('.ca-profile-card').waitFor();assert.equal(await page.locator('.ca-profile-shortcuts button').count(),3);await screenshot('profile-guest',width);
   await page.goto('http://localhost:3000/cart');await page.getByRole('heading',{name:'Your cart is waiting for a little care',exact:true}).waitFor();await screenshot('cart-empty',width);
  }
  loggedIn=true;
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1000});
   await page.goto('http://localhost:3000/labtest?lab=redcliffe');await page.getByRole('heading',{name:'Live Health Package 1',exact:true}).waitFor();assert.equal(await page.locator('.cl-test-card').count(),6);assert.equal(await page.locator('main.ca-lab-packages').count(),1);await screenshot('lab-packages',width);
   await page.goto('http://localhost:3000/labtest?lab=redcliffe&test=redcliffe%3Astyle-0');await page.locator('.cl-detail-art img').waitFor();assert.equal(await page.locator('.cl-facts>div').count(),5);await screenshot('lab-details',width);
   await page.getByRole('link',{name:'Included Tests',exact:true}).click();await page.locator('summary').filter({hasText:'Heart markers'}).waitFor();await page.locator('summary').filter({hasText:'Heart markers'}).click();await page.getByText('Cholesterol',{exact:true}).waitFor();await screenshot('included-tests',width);
   await page.goto('http://localhost:3000/profile');await page.getByRole('heading',{name:'Style Customer',exact:true}).waitFor();assert.equal(await page.locator('.ca-profile-menu button').count(),8);await screenshot('profile-account',width);
   await page.goto('http://localhost:3000/profile?tab=orders');await page.getByRole('button',{name:'Labs',exact:true}).click();await page.getByRole('heading',{name:'fixture-lab-order',exact:true}).waitFor();assert.equal(await page.locator('[aria-label="Order status"] button').count(),4);await screenshot('orders',width);
   await page.evaluate(()=>localStorage.setItem('merabetta-web-v2',JSON.stringify({cart:{p1:2},wishlist:[],coupon:false})));
   await page.goto('http://localhost:3000/cart');await page.locator('.ca-cart-item').waitFor();assert.equal(await page.locator('.ca-cart-layout .ca-summary').count(),1);assert.equal(await page.locator('.ca-cart-item img').count(),1);await screenshot('cart-items',width);
   await page.goto('http://localhost:3000/profile?tab=wishlist');await page.getByRole('button',{name:'Products',exact:true}).waitFor();await screenshot('wishlist',width);
  }
  assert.deepEqual(errors,[]);console.log('PASS: original layout classes, exactly 6 lab cards / 1 link / 5 disabled (guest and authenticated), API catalog/cards/details/parameters, profile/shortcuts/menu, cart empty/items/summary, orders tabs/filters, wishlist and no overflow at 390/1440.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
