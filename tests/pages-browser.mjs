import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const prefix='/ecole-alma/';
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!path.startsWith(prefix)){res.writeHead(404).end();return;}
  try{
    const relative=path.slice(prefix.length)||'index.html';
    const data=await readFile(new URL('../frontend/'+relative,import.meta.url));
    const types={html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml',png:'image/png',webmanifest:'application/manifest+json'};
    res.writeHead(200,{'Content-Type':types[relative.split('.').at(-1)]||'application/octet-stream'}).end(data);
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}${prefix}`;
const {chromium}=createRequire(import.meta.url)(process.argv[2]||'playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(url);
 await page.getByRole('heading',{name:/Bienvenue dans ton royaume/}).waitFor();
 await page.evaluate(()=>navigator.serviceWorker.ready);
 assert.ok(await page.locator('.brand img').evaluate(img=>img.complete&&img.naturalWidth>0));
 const manifest=await page.evaluate(async()=>await(await fetch('./manifest.webmanifest')).json());
 assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
 await page.reload();
 await context.setOffline(true);
 await page.reload();
 await page.getByRole('heading',{name:/Bienvenue dans ton royaume/}).waitFor();
 await page.getByRole('button',{name:'Choisir ma mission →',exact:true}).click();
 await page.locator('[data-id="number"]').click();
 await page.getByRole('button',{name:'À moi d’essayer →',exact:true}).click();
 await page.locator('.exercise').waitFor();
 assert.deepEqual(errors,[]);
 console.log('GitHub Pages: sous-chemin /ecole-alma/, images, manifeste, cache et mission hors ligne OK.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
