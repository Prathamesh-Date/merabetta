// Local guest-only checks. API fixtures prevent SMS, payments and real customer mutations.
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.STOREFRONT_BASE_URL || 'http://localhost:3000';
const test = { id:'redcliffe:guest-storefront', packageCode:'GUEST', labId:'redcliffe', labName:'Redcliffe Labs', name:'Guest Saved Test', price:199, mrp:299, available:true, category:'Tests', parameters:1 };
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page = await browser.newPage({viewport:{width:390,height:1000}});
 const errors=[]; let failCatalog=false, unrelatedCatalog=false, catalogReads=0;
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('https://blog.merabetta.com/**',route=>route.abort());
 await page.route('https://merabetta.com/images/community-event.png',route=>route.abort());
 await page.route('**/api/app/**',async route=>{
  assert.equal(route.request().method(),'GET','Guest storefront must not send mutations');
  const path=new URL(route.request().url()).pathname;
  let status=200,data;
  if(path.endsWith('/auth/me')){status=401;data={error:'Login required'};}
  else if(path.endsWith('/redcliffe/catalog')){catalogReads++;status=failCatalog?503:200;data=failCatalog?{error:'Catalog temporarily unavailable'}:{data:[unrelatedCatalog?{...test,id:'redcliffe:other',name:'Other available test'}:test]};}
  else if(path.endsWith('/labs/lablisting'))data={data:[{id:'redcliffe',name:'Redcliffe Labs',active:true,city:'Pune',homeCollection:true}],pagination:{totalPages:1}};
  else {status=404;data={error:'Unmocked read'};}
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 });
 async function go(path){await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>{const button=[...document.querySelectorAll('[data-desktop-navbar] button')].find(el=>el.textContent.includes('Sign in'));return button&&!button.disabled;});}
 async function cartCount(count){await page.waitForFunction(value=>JSON.parse(localStorage.getItem('merabetta-web-v2')).cart.p1===value,count);}
 async function fit(label){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,label+' overflow');}
 fs.mkdirSync('artifacts/storefront',{recursive:true});
 try{
  await go('/products');await page.locator('.ca-catalog-category-grid').getByRole('button',{name:'More',exact:true}).click();
  assert.equal(await page.locator('.ca-product').count(),8);
  for(const order of ['low','high']){
   await page.getByLabel('Filter products by sort order').selectOption(order);
   const prices=await page.locator('.ca-product-bottom strong').allTextContents();const values=prices.map(value=>Number(value.replace(/[^0-9.]/g,'')));
   assert.deepEqual(values,[...values].sort((a,b)=>order==='low'?a-b:b-a));
  }
  await page.getByLabel('Search products',{exact:true}).fill('  cRoCiN  ');assert.equal(await page.locator('.ca-product').count(),1);
  await page.getByLabel('Search products',{exact:true}).fill('nothing-matches-storefront');await page.getByRole('heading',{name:'No products found',exact:true}).waitFor();
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();await page.locator('.ca-catalog-category-grid').getByRole('button',{name:'Personal Care',exact:true}).click();
  assert.equal(await page.locator('.ca-product').count(),2);
  console.log('PASS product search, category selection, both price sorts and empty-filter recovery.');

  await go('/products/p1');await page.getByRole('tab',{name:'Description',exact:true}).focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:'Reviews (0)',exact:true}).getAttribute('aria-selected'),'true');await page.getByRole('heading',{name:'No reviews yet',exact:true}).waitFor();
  await page.keyboard.press('Home');assert.equal(await page.getByRole('tab',{name:'Description',exact:true}).getAttribute('aria-selected'),'true');
  await page.keyboard.press('End');assert.equal(await page.getByRole('tab',{name:'Reviews (0)',exact:true}).getAttribute('tabindex'),'0');
  await page.keyboard.press('ArrowLeft');assert.equal(await page.getByRole('tab',{name:'Description',exact:true}).getAttribute('aria-selected'),'true');
  await page.getByRole('button',{name:'Increase Crocin Advance Tablet quantity',exact:true}).click();await page.locator('.cp-purchase').getByRole('button',{name:'Add to cart',exact:true}).click();await cartCount(2);
  for(const width of [320,900,1440]){await page.setViewportSize({width,height:1000});await fit('Product details '+width);await page.screenshot({path:`artifacts/storefront/product-${width}.png`});}
  await page.getByRole('button',{name:'Save product to wishlist',exact:true}).click();
  await go('/profile?tab=wishlist');await page.getByRole('heading',{name:'Crocin Advance Tablet',exact:true}).waitFor();await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Crocin Advance Tablet',exact:true}).waitFor();
  await page.getByRole('button',{name:'Add Crocin Advance Tablet to cart',exact:true}).click();await cartCount(3);
  await page.getByRole('button',{name:'Remove Crocin Advance Tablet from wishlist',exact:true}).first().click();await page.getByRole('heading',{name:'Nothing yet here',exact:true}).waitFor();
  console.log('PASS product tabs with keyboard, quantity selection, add-to-cart and product wishlist reload/removal.');

  await go('/cart');await page.getByRole('heading',{name:'Crocin Advance Tablet',exact:true}).waitFor();
  await page.getByRole('button',{name:'Increase Crocin Advance Tablet quantity',exact:true}).click();await cartCount(4);await page.getByRole('button',{name:'Decrease Crocin Advance Tablet quantity',exact:true}).click();await cartCount(3);
  await page.getByRole('button',{name:'Proceed to checkout - Rs. 196',exact:true}).waitFor();
  await page.getByLabel('Coupon code',{exact:true}).fill('NOT-VALID');await page.getByRole('button',{name:'Apply',exact:true}).click();await page.getByRole('alert').filter({hasText:'This coupon code is not valid'}).waitFor();
  assert.equal(await page.getByLabel('Coupon code').getAttribute('aria-invalid'),'true');
  await page.getByLabel('Coupon code').fill(' mera20 ');await page.getByRole('button',{name:'Apply',exact:true}).click();await page.getByRole('button',{name:'Proceed to checkout - Rs. 165',exact:true}).waitFor();
  await page.getByLabel('Coupon code').evaluate(el=>{window.__couponInvalidFired=false;el.addEventListener('invalid',()=>{window.__couponInvalidFired=true;});});
  await page.getByRole('button',{name:'Remove',exact:true}).click();await page.getByRole('button',{name:'Proceed to checkout - Rs. 196',exact:true}).waitFor();assert.equal(await page.evaluate(()=>window.__couponInvalidFired),false,'Removing a coupon must not submit the coupon form');
  for(const width of [320,900,1440]){await page.setViewportSize({width,height:1000});await fit('Cart '+width);await page.screenshot({path:`artifacts/storefront/cart-${width}.png`});}
  await page.getByRole('button',{name:'Remove Crocin Advance Tablet from cart',exact:true}).click();await page.getByRole('heading',{name:'Your cart is waiting for a little care',exact:true}).waitFor();
  console.log('PASS cart increase/decrease/removal, totals, invalid coupon feedback, valid coupon apply/remove and empty cart.');

  await go('/labtest?lab=redcliffe');await page.getByRole('button',{name:'Save Guest Saved Test',exact:true}).click();const readsBefore=catalogReads;
  await go('/profile?tab=wishlist');await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:test.name,exact:true}).waitFor();assert(catalogReads>readsBefore,'Guest wishlist must restore live tests after reload');
  failCatalog=true;await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Wishlist temporarily unavailable',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Nothing yet here',exact:true}).count(),0);
  assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('merabetta-web-v2')).wishlist)).includes(test.id));
  failCatalog=false;await page.getByRole('button',{name:'Retry loading wishlist',exact:true}).click();await page.getByRole('heading',{name:test.name,exact:true}).waitFor();
  unrelatedCatalog=true;await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Saved items are unavailable',exact:true}).waitFor();
  unrelatedCatalog=false;await page.getByRole('button',{name:'Retry loading wishlist',exact:true}).click();await page.getByRole('heading',{name:test.name,exact:true}).waitFor();
  for(const width of [320,900,1440]){await page.setViewportSize({width,height:1000});await fit('Wishlist '+width);await page.screenshot({path:`artifacts/storefront/wishlist-${width}.png`});}
  await page.getByRole('button',{name:'Unsave '+test.name,exact:true}).click();await page.getByRole('heading',{name:'Nothing yet here',exact:true}).waitFor();
  console.log('PASS guest lab wishlist reload, catalog failure without losing saved IDs, retry and removal.');

  const links=new Set();const brokenImages=[];
  for(const path of ['/','/products','/products/p1','/blog','/contact','/community']){
   await go(path);for(const href of await page.locator('a[href^="/"]').evaluateAll(elements=>elements.map(el=>el.getAttribute('href'))))links.add(href.split('#')[0]);
   if(path==='/'){for(const [index,image] of [[2,'wellness-circle'],[3,'lab-circle']]){await page.getByRole('button',{name:new RegExp('^Show banner '+index+':')}).click();await page.waitForFunction(name=>{const image=document.querySelector('[data-reference-hero] picture img');return image&&image.src.endsWith('/hero/'+name+'.webp')&&image.complete&&image.naturalWidth>0;},image);}await page.getByRole('button',{name:/^Show banner 1:/}).click();}
   if(path==='/blog'){await page.locator('main article img').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const image=document.querySelector('main article img');return image&&image.src.endsWith('/blog/merabetta-blog-hero.webp')&&image.complete&&image.naturalWidth>0;});}
   if(path==='/community'){await page.locator('main section[class*=split] img').scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const image=document.querySelector('main section[class*=split] img');return image&&image.src.endsWith('/app/community-banner-no-text.webp')&&image.complete&&image.naturalWidth>0;});}
   for(const image of await page.locator('main img').evaluateAll(elements=>elements.map(el=>({src:el.getAttribute('src'),alt:el.getAttribute('alt')})))){
    assert.notEqual(image.alt,null,'Image needs alt text: '+image.src);
    if(image.src.startsWith('/')&&(await page.request.get(base+image.src)).status()!==200)brokenImages.push(image.src);
   }
   assert.equal(await page.locator('a[href="https://twitter.com/"]').count(),0,'No placeholder social profile');
  }
  for(const href of links){const response=await page.request.get(base+href);assert(response.status()<400,href+' returned '+response.status());}
  assert.equal((await page.request.get(base+'/products/not-a-product')).status(),404);
  assert.deepEqual(brokenImages,[]);assert.deepEqual(errors,[]);
  console.log(`PASS ${links.size} internal destinations, local main-content image URLs/alt text, product 404 and no runtime errors.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
