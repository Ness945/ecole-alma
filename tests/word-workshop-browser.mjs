import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {launch} from './browser-launch.mjs';
import {wordBanks,arrowPuzzles} from '../frontend/js/word-workshop.js';
const {chromium}=createRequire(import.meta.url)(process.argv[2]||'playwright');
const browser=await launch(chromium);
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('academie.save.v2')));
 await page.goto(process.argv[3]||'http://localhost:4173/');
 await page.locator('[data-action="words-open"]').first().click();
 for(const mode of ['cloze','infinitive','adjective','arrow'])for(let p=0;p<3;p++){
  await page.locator(`[data-action="words-start"][data-mode="${mode}"][data-puzzle="${p}"]`).click();
  for(let i=0;i<(mode==='arrow'?3:4);i++){
   if(mode==='arrow')await page.locator(`[data-action="words-select"][data-index="${i}"]`).click();
   const answer=mode==='arrow'?arrowPuzzles[p].words[i].answer:wordBanks[mode][p*4+i][2];
   if(mode==='cloze'&&p===0&&i===0){await page.locator('#word-input').fill('xxxx');await page.locator('[data-action="words-check"]').click();assert.equal((await state()).wordGame.results.at(-1).correct,false);}
   await page.locator('#word-input').fill(answer);
   if(mode==='arrow'&&p===0&&i===0){
    await page.reload();await page.locator('[data-action="words-open"]').first().click();await page.locator('[data-action="words-resume"]').click();assert.equal(await page.locator('#word-input').inputValue(),answer);
    await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/word-workshop-mobile.png',fullPage:true});
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('[data-action="words-check"]').click();
   assert.equal((await state()).wordGame.results.at(-1).correct,true);
   if(mode!=='arrow')await page.locator('[data-action="words-next"]').click();
  }
  assert.equal((await state()).wordGame.finished,true);
  await page.getByRole('button',{name:'Choisir un autre jeu',exact:true}).click();
 }
 assert.equal((await state()).rpg.coins,120);
 await page.getByText(/Mes grilles terminées/).click();
 await page.locator('[data-action="words-start"][data-mode="arrow"][data-puzzle="0"]').click();
 await page.locator('[data-action="words-hint"]').click();
 assert.ok((await state()).wordGame.assisted.includes(0));
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();
 await page.locator('[data-action="words-open"]').first().click();await page.locator('[data-action="words-resume"]').click();
 for(let i=0;i<3;i++){await page.locator(`[data-action="words-select"][data-index="${i}"]`).click();await page.locator('#word-input').fill(arrowPuzzles[0].words[i].answer);await page.locator('[data-action="words-check"]').click();}
 assert.equal((await state()).rpg.coins,120);
 await page.getByRole('button',{name:'Une nouvelle grille →',exact:true}).click();
 assert.equal((await state()).wordGame.puzzle,3);
 for(let i=0;i<3;i++){await page.locator('[data-action="words-select"][data-index="'+i+'"]').click();await page.locator('#word-input').fill(arrowPuzzles[3].words[i].answer);await page.locator('[data-action="words-check"]').click();}
 assert.equal((await state()).rpg.coins,130);
 await page.getByRole('button',{name:'Choisir un autre jeu',exact:true}).click();
 assert.equal(await page.locator('[data-action="words-start"][data-mode="arrow"][data-puzzle="3"]').isVisible(),false);
 assert.equal(await page.locator('[data-action="words-start"][data-mode="arrow"][data-puzzle="4"]').isVisible(),true);
 assert.deepEqual(errors,[]);
 console.log('Atelier : exercices, grilles originales et générée, archivage, enchaînement, reprise, hors ligne et récompenses OK.');
}finally{await browser.close();}
