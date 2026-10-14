// Mock sessions only. Never logs out a real customer.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try {
  const page = await browser.newPage(); let signedIn=true, allowed=false, logoutCalls=0;
  const account={user:{id:'logout-fixture',name:'Logout Test Customer',email:'fixture@example.test',profileCompleted:true},identities:[],addresses:[],members:[]};
  await page.route('**/api/app/**',async route=>{
   const request=route.request(), path=new URL(request.url()).pathname;let status=200,data;
   if(path.endsWith('/auth/me')){status=signedIn?200:401;data=signedIn?account:{error:'Login required'};}
   else if(path.endsWith('/auth/logout')){
    logoutCalls++;assert.equal(request.method(),'POST');assert.deepEqual(request.postDataJSON(),{});
    if(!allowed){status=403;data={error:'App origin is not allowed. Check API ALLOWED_ORIGINS configuration.'};}
    else {signedIn=false;return route.fulfill({status:204});}
   }else {status=404;data={error:'Unmocked request'};}
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.goto('http://localhost:3000/profile',{waitUntil:'domcontentloaded'});
  const main=page.locator('main');await main.getByRole('heading',{name:account.user.name,exact:true}).waitFor();
  await page.evaluate(()=>{localStorage.setItem('merabetta-web-v2',JSON.stringify({cart:{p1:1},wishlist:['p1'],coupon:true}));sessionStorage.setItem('merabetta-pending-checkout-logout-fixture','test-pending');});
  await page.reload({waitUntil:'domcontentloaded'});
  await main.getByRole('button',{name:'Sign out',exact:true}).click();
  await main.getByRole('alert').filter({hasText:'App origin is not allowed'}).waitFor();
  assert.equal(await main.getByRole('heading',{name:account.user.name,exact:true}).isVisible(),true);
  assert.equal(await main.getByRole('button',{name:'Sign out',exact:true}).isEnabled(),true);
  allowed=true;
  await main.getByRole('button',{name:'Sign out',exact:true}).click();
  await main.getByRole('heading',{name:'Welcome to Merabetta',exact:true}).waitFor();
  await page.waitForFunction(()=>{const saved=JSON.parse(localStorage.getItem('merabetta-web-v2'));return !Object.keys(saved.cart).length&&!saved.wishlist.length&&!saved.coupon&&!sessionStorage.getItem('merabetta-pending-checkout-logout-fixture');});
  await page.reload({waitUntil:'domcontentloaded'});
  await main.getByRole('heading',{name:'Welcome to Merabetta',exact:true}).waitFor();
  assert.equal(await main.getByRole('button',{name:'Sign out',exact:true}).isDisabled(),true);
  assert.equal(logoutCalls,2);
  console.log('PASS: logout 403 is shown honestly; 204 clears account/cart/wishlist/pending state and survives reload.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
