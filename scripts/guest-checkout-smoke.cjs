// Complete guest -> cart -> sign-in -> same checkout with mocked backend only.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const address={id:'fixture-address',line1:'Flat 12 Test Residency',houseNumber:'12',city:'Pune',state:'Maharashtra',postalCode:'411045',location:{provider:'locationiq',placeId:'fixture-pin',displayName:'Pune, India',latitude:18.56,longitude:73.78,address:{city:'Pune',country_code:'in'}}};
const account={user:{id:'guest-flow-user',name:'Guest Customer',firstName:'Guest',lastName:'Customer',phone:'9876543210',email:'guest@example.com',dateOfBirth:'1990-01-01',gender:'Female',profileCompleted:true},identities:[{method:'phone',contact:'9876543210'}],addresses:[address],members:[{id:'fixture-member',name:'Guest Customer',relationship:'Self',gender:'Female',dateOfBirth:'1990-01-01'}]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  for(const match of [true,false]){
   const context=await browser.newContext();const page=await context.newPage();let signedIn=false;let orderBody;const calls=[];
   const live={id:'redcliffe:live-checkup',packageCode:'LIVE',labId:'redcliffe',labName:'Redcliffe Labs',name:'Guest API Health Checkup',price:799,mrp:1599,category:'Full Body',categories:['Full Body'],parameters:97,available:true};
   await page.route('**/api/app/**',async route=>{
    const request=route.request();const path=new URL(request.url()).pathname.replace('/api/app','');calls.push({path,guest:!signedIn});let data;let status=200;
    if(path==='/auth/me'){data=signedIn?account:{error:'Login required'};status=signedIn?200:401;}
    else if(path==='/auth/otp/request')data={challengeId:'fixture',delivery:'sms',expiresIn:600,resendAfter:30};
    else if(path==='/auth/otp/verify'){signedIn=true;data=match?{...account,user:{...account.user,firstName:'',lastName:'',email:'',dateOfBirth:'',profileCompleted:false},addresses:[],members:[]}:account;}
    else if(path==='/customers/me/profile' && request.method()==='PUT')data=account;
    else if(path==='/redcliffe/catalog')data={data:[live]};
    else if(path==='/labs/lablisting')data={data:[{id:'redcliffe',name:'Redcliffe Labs',active:true,city:'Pune'}],pagination:{totalPages:1}};
    else if(path==='/states')data={data:[{id:'fixture-state',name:'Maharashtra'}]};
    else if(path.startsWith('/states/'))data={data:[{id:'fixture-city',name:'Pune'}]};
    else if(path==='/locations/map')data={uri:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII='};
    else if(path==='/redcliffe/dates')data={dates:['2026-10-15'],timeZone:'Asia/Kolkata'};
    else if(path==='/redcliffe/slots')data={serviceable:true,message:'',slots:[{id:'27',label:'9:00 AM',available:true}]};
    else if(path==='/lab-bookings' && request.method()==='POST'){orderBody=request.postDataJSON();data={id:'fixture-booking',status:'Confirmed',kind:'labs',total:799,paymentStatus:'Payment to Redcliffe'};status=201;}
    else {status=404;data={error:'Unmocked request'};}
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
   });
   await page.goto('http://localhost:3000/labtest');const main=page.locator('main');assert.equal(await main.locator('.cl-lab-card').count(),6);
   await main.locator('a.cl-lab-card').click();await main.getByRole('heading',{name:'Guest API Health Checkup',exact:true}).waitFor();assert.equal(await main.getByLabel('Mobile number',{exact:true}).count(),0);
   await main.getByRole('button',{name:'Add Guest API Health Checkup from Redcliffe Labs to cart',exact:true}).click();
   await page.waitForFunction(()=>localStorage.getItem('merabetta-web-v2')?.includes('redcliffe:live-checkup'));
   await page.goto('http://localhost:3000/cart');await main.getByRole('heading',{name:'Guest API Health Checkup',exact:true}).waitFor();
   await page.reload();await main.getByRole('heading',{name:'Guest API Health Checkup',exact:true}).waitFor();assert.equal(await main.getByLabel('Mobile number',{exact:true}).count(),0);
   assert.equal(calls.some(call=>call.guest&&call.path==='/redcliffe/catalog'),true);
   await main.getByRole('button',{name:/^Proceed to checkout - Rs\./}).click();
   await main.getByRole('heading',{name:'Sign in with your mobile',exact:true}).waitFor();
   await main.getByLabel('Mobile number',{exact:true}).fill('9876543210');await main.getByRole('button',{name:'Send OTP',exact:true}).click();await main.getByLabel('OTP',{exact:true}).fill('123456');await main.getByRole('button',{name:'Verify OTP',exact:true}).click();
   if(match){await main.getByRole('heading',{name:'Complete your profile',exact:true}).waitFor();await main.getByLabel('First name',{exact:true}).fill('Guest');await main.getByLabel('Last name',{exact:true}).fill('Customer');await main.getByLabel('Email',{exact:true}).fill('guest@example.com');await main.getByLabel('Date of birth',{exact:true}).fill('1990-01-01');await main.getByRole('button',{name:'Save profile',exact:true}).click();}
   await main.getByRole('heading',{name:'Your selected tests',exact:true}).waitFor();assert.ok(page.url().includes('/cart'));assert.equal(await main.getByLabel('Mobile number',{exact:true}).count(),0);
   await page.waitForFunction(()=>localStorage.getItem('merabetta-web-v2')?.includes('redcliffe:live-checkup'));
   await main.getByRole('button',{name:'Continue to family member',exact:true}).click();await main.getByRole('button',{name:'Continue to address & slot',exact:true}).click();await main.getByRole('button',{name:'15 October 2026',exact:true}).click();await main.getByRole('button',{name:'9:00 AM',exact:true}).click();await main.getByRole('button',{name:'Review booking',exact:true}).click();await main.getByRole('button',{name:'Confirm booking',exact:true}).click();await main.getByRole('heading',{name:/Booking status: Confirmed/}).waitFor();assert.equal(orderBody.items[0].id,live.id);assert.equal(orderBody.items[0].quantity,1);assert.equal(orderBody.total,undefined);
   await page.evaluate(()=>localStorage.setItem('merabetta-web-v2',JSON.stringify({cart:{p1:1},wishlist:[],coupon:false})));
   signedIn=false;await page.goto('http://localhost:3000/cart');await main.getByRole('heading',{name:'Crocin Advance Tablet',exact:true}).waitFor();await main.getByRole('button',{name:/^Proceed to checkout - Rs\./}).click();await main.getByRole('heading',{name:'Sign in with your mobile',exact:true}).waitFor();
   fs.mkdirSync('artifacts/restored-styles',{recursive:true});await page.setViewportSize({width:390,height:1000});await page.screenshot({path:`artifacts/restored-styles/checkout-signin-${match}.png`,fullPage:true});
   await context.close();
  }
  console.log('PASS: unauthenticated browsing/detail/add-to-cart, cart survives reload, auth only at Proceed to checkout with Sign in, new-account profile completion and existing login continue the same checkout, public API-only browsing, current-ID payload, product checkout login gate.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
