import test from 'node:test';
import assert from 'node:assert/strict';
import {contrast,fields,initialDesign,evaluate,total,validateRegistration,workshops} from '../src/game.mjs';
test('contrast is symmetric and uses relative luminance',()=>{
  assert.equal(contrast('#000000','#ffffff'),21);assert.equal(contrast('#abcdef','#abcdef'),1);
  assert.equal(contrast('#123456','#eeeeee'),contrast('#eeeeee','#123456'));
});
test('all seven-choice combinations produce five checks and scores between zero and ten',()=>{
  const scores=new Set();
  function visit(step,design){
    if(step===fields.length){const checks=evaluate(design);assert.equal(checks.length,5);assert.ok(checks.every(c=>c.points>=0&&c.points<=2));scores.add(total(design));return;}
    const f=fields[step];for(const o of f.options)visit(step+1,{...design,[f.key]:o.value});
  }
  visit(0,{});assert.equal(scores.size,11);assert.equal(total(initialDesign),10);
});
test('a change to one form choice can affect only its own domain',()=>{
  const baseline={...initialDesign,input:'placeholder',session:'text'};
  assert.equal(total(baseline),6);assert.equal(total({...baseline,input:'guided'}),8);
  assert.equal(total({...baseline,session:'menu'}),7);
});
test('registration requires correct code and session and accepts harmless text variation',()=>{
  for(const event of workshops){
    assert.deepEqual(validateRegistration(event,event.code,' '+event.session.toUpperCase()+' '),{code:'',session:''});
    assert.ok(validateRegistration(event,'123',event.session).code);assert.ok(validateRegistration(event,event.code,'').session);
  }
});
