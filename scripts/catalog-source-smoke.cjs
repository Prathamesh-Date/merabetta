const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  for(const mode of ['guest-public','guest-blocked','unfinished-profile','empty-live']){
   const context=await browser.newContext();const page=await context.newPage();let catalogReads=0;
   await page.route('**/api/app/**',async route=>{
    const path=new URL(route.request().url()).pathname.replace('/api/app','');let data;let status=200;
    if(path==='/auth/me'){status=mode.startsWith('guest')?401:200;data=status===401?{error:'Login required'}:{user:{id:'fixture',name:'Fixture',phone:'9876543210',email:'',profileCompleted:false},identities:[],addresses:[],members:[]};if(mode==='guest-public')await new Promise(resolve=>setTimeout(resolve,500));}
    else if(path==='/redcliffe/catalog'){catalogReads++;status=mode==='guest-blocked'?401:200;data=status===401?{error:'Login required'}:{data:mode==='empty-live'?[]:[{id:'redcliffe:source-test',packageCode:'SOURCE',name:'API Source Test',labName:'Redcliffe Labs',category:'Lab test',price:123,mrp:123,available:true}]};}
    else if(path==='/labs/lablisting')data={data:[{id:'redcliffe',name:'Redcliffe Labs',active:true,city:'Pune'}],pagination:{totalPages:1}};
    else {status=404;data={error:'Unmocked read'};}
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
   });
   await page.goto('http://localhost:3000/labtest?lab=redcliffe');const main=page.locator('main');
   if(mode==='guest-blocked'){await main.getByText(/Live test catalog is temporarily unavailable/).waitFor();assert.ok(catalogReads>0);assert.equal(await main.locator('.cl-test-card').count(),0);}
   else if(mode==='unfinished-profile'||mode==='guest-public'){await main.getByRole('heading',{name:'API Source Test',exact:true}).waitFor();if(mode==='guest-public'){await page.waitForTimeout(700);assert.equal(await main.getByRole('heading',{name:'API Source Test',exact:true}).isVisible(),true);}assert.ok(catalogReads>0);assert.equal(await main.getByRole('heading',{name:'Complete Health Checkup',exact:true}).count(),0);}
   else {await main.getByRole('heading',{name:'No matching tests',exact:true}).waitFor();assert.ok(catalogReads>0);assert.equal(await main.locator('.cl-test-card').count(),0);}
   await context.close();
  }
  console.log('PASS: guest and signed-in screens use API data only; public catalog survives background anonymous session checks; blocked guest API shows unavailable state; empty responses never render hardcoded tests.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
