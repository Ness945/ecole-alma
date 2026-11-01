import test from 'node:test';
import assert from 'node:assert/strict';
import {generateArrowPuzzles} from '../frontend/js/arrow-generator.js';
import {arrowPuzzles,availableArrows,newWordGame,writeGrid,answerWord,validWordGame} from '../frontend/js/word-workshop.js';
test('503 grilles distinctes et génération reproductible',()=>{
 assert.equal(arrowPuzzles.length,503);
 assert.equal(new Set(arrowPuzzles.map(p=>p.words.map(w=>w.answer).sort().join(':'))).size,503);
 assert.deepEqual(generateArrowPuzzles(),generateArrowPuzzles());
});
test('Toutes les grilles générées peuvent être résolues et sauvegardées',()=>{
 for(let n=0;n<arrowPuzzles.length;n++){
  const g=newWordGame('arrow',n);
  for(let i=0;i<3;i++){g.index=i;writeGrid(g,arrowPuzzles[n].words[i].answer);assert.ok(answerWord(g).correct);assert.ok(validWordGame(g));}
  assert.ok(g.finished);
 }
});
test('Les grilles finies disparaissent des suggestions sans effacer les récompenses',()=>{
 const s={completed:['words:arrow:0','words:arrow:3','words:cloze:1']};
 const next=availableArrows(s);assert.equal(next.length,501);assert.ok(!next.includes(0));assert.ok(!next.includes(3));assert.equal(next[0],1);assert.equal(s.completed.length,3);
});
