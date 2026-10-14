// Capture the real UI with test API responses; never sends a real SMS or login.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:430,height:1100},deviceScaleFactor:1});
 let signedIn=false;
 const account={user:{id:'preview-account',name:'Demo Customer',firstName:'Demo',lastName:'Customer',phone:'9876543210',email:'demo@example.com',dateOfBirth:'1990-01-01',gender:'Female',profileCompleted:true},identities:[{method:'phone',contact:'9876543210'}],addresses:[],members:[]};
 await page.route('**/api/app/**',async route=>{
   const path=new URL(route.request().url()).pathname.replace('/api/app','');let data;let status=200;
   if(path==='/auth/me'){status=signedIn?200:401;data=signedIn?account:{error:'Login required'};}
   else if(path==='/auth/otp/request')data={challengeId:'preview-challenge',expiresIn:600,resendAfter:30,delivery:'sms'};
   else {status=404;data={error:'Preview only'};}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 });
 fs.mkdirSync('artifacts/account-previews',{recursive:true});
 try{
   await page.goto('http://localhost:3000/profile');
   const main=page.locator('main');await main.getByRole('button',{name:'Sign in',exact:true}).click();
   const dialog=main.locator('dialog[open]');await dialog.getByLabel('Mobile number',{exact:true}).waitFor();
   await dialog.screenshot({path:'artifacts/account-previews/sign-in.png'});
   await dialog.getByLabel('Mobile number',{exact:true}).fill('9876543210');await dialog.getByRole('button',{name:'Send OTP',exact:true}).click();await dialog.getByLabel('OTP',{exact:true}).waitFor();
   await dialog.screenshot({path:'artifacts/account-previews/otp-verification.png'});
   signedIn=true;await page.setViewportSize({width:430,height:1600});await page.goto('http://localhost:3000/profile');await main.getByRole('heading',{name:'Demo Customer',exact:true}).waitFor();
   await main.locator('.ca-profile-page').screenshot({path:'artifacts/account-previews/account.png'});
   console.log('Captured sign-in, OTP verification and account previews using test data only.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
