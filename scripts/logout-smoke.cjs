// Mock sessions only. Never logs out a real customer.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try {
  for (const width of [1440,390]) {
   const page = await browser.newPage({viewport:{width,height:1000}});
   let signedIn=true, allowed=false, logoutCalls=0, releaseLogout, expired=false;
   const errors=[]; page.on('pageerror', e=>errors.push(e.message));
   const account={user:{id:'logout-fixture',name:'Logout Test Customer',email:'fixture@example.test',profileCompleted:true},identities:[],addresses:[],members:[]};
   await page.route('**/api/app/**',async route=>{
    const request=route.request(), path=new URL(request.url()).pathname;let status=200,data;
    if(path.endsWith('/auth/me')){status=signedIn?200:401;data=signedIn?account:{error:'Login required'};}
    else if(path.endsWith('/auth/logout')){
     logoutCalls++;assert.equal(request.method(),'POST');assert.deepEqual(request.postDataJSON(),{});
     if(!allowed){status=403;data={error:'App origin is not allowed. Check API ALLOWED_ORIGINS configuration.'};}
     else {
      if(!expired) await new Promise(resolve=>{releaseLogout=resolve;});
      signedIn=false;return route.fulfill(expired?{status:401,contentType:'application/json',body:JSON.stringify({error:'Session expired'})}:{status:204});
     }
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
   assert.equal(await main.getByRole('dialog',{name:'Signed out successfully'}).count(),0);
   assert.equal(await main.getByRole('button',{name:'Sign out',exact:true}).isEnabled(),true);
   allowed=true;
   await Promise.all([page.waitForRequest('**/api/app/auth/logout'),main.getByRole('button',{name:'Sign out',exact:true}).click()]);
   const pending=main.getByRole('button',{name:'Signing out…',exact:true});
   assert.equal(await pending.isDisabled(),true);
   assert.equal(await pending.getAttribute('aria-busy'),'true');
   assert.equal(await main.getByRole('dialog',{name:'Signed out successfully'}).count(),0);
   await pending.screenshot({path:`artifacts/signout-loading-${width}.png`});
   releaseLogout();
   const success=main.getByRole('dialog',{name:'Signed out successfully'});
   await success.waitFor();
   await main.getByRole('heading',{name:'Welcome to Merabetta',exact:true}).waitFor();
   assert.equal(await main.getByRole('heading',{name:account.user.name,exact:true}).count(),0);
   assert.equal(await success.evaluate(el=>el.contains(document.activeElement)),true);
   assert.equal(await success.evaluate(el=>el.scrollWidth>el.clientWidth),false);
   await page.evaluate(()=>document.fonts.ready);
   await success.screenshot({path:`artifacts/signout-success-${width}.png`});
   await page.waitForFunction(()=>{const saved=JSON.parse(localStorage.getItem('merabetta-web-v2'));return !Object.keys(saved.cart).length&&!saved.wishlist.length&&!saved.coupon&&!sessionStorage.getItem('merabetta-pending-checkout-logout-fixture');});
   await success.getByRole('button',{name:'Continue browsing'}).click();
   await page.waitForURL('http://localhost:3000/');
   await page.goto('http://localhost:3000/profile',{waitUntil:'domcontentloaded'});
   await main.getByRole('heading',{name:'Welcome to Merabetta',exact:true}).waitFor();
   assert.equal(await main.getByRole('button',{name:'Sign out',exact:true}).isDisabled(),true);
   // An already-expired session is also safely cleared and acknowledged.
   signedIn=true;expired=true;
   await page.reload({waitUntil:'domcontentloaded'});
   await main.getByRole('heading',{name:account.user.name,exact:true}).waitFor();
   await main.getByRole('button',{name:'Sign out',exact:true}).click();
   await success.waitFor();
   await success.getByRole('button',{name:'Sign in again',exact:true}).click();
   const auth=main.getByRole('dialog',{name:'Sign in',exact:true});
   await auth.waitFor();
   assert.equal(await success.count(),0);
   assert.equal(await auth.evaluate(el=>el.contains(document.activeElement)),true);
   await auth.getByRole('button',{name:'Close login'}).click();
   assert.equal(logoutCalls,3);assert.deepEqual(errors,[]);
   console.log(`PASS ${width}px: pending spinner; failure retains account; success clears private data; Continue browsing opens Home; sign-in again works; expired session clears safely.`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
