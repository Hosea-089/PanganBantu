import test from 'node:test';
import assert from 'node:assert/strict';
import {recipes,ingredients,defaultForm,defaultPrefs,demoStock,generate,calculate,allowed} from '../src/model.js';

test('daily, meal and grocery totals agree; stock is never counted twice',()=>{
 const p=generate(defaultForm,demoStock,defaultPrefs).plan,c=calculate(p,demoStock);
 for(const key of ['min','max'])assert.equal(c[key],c.meals.reduce((n,m)=>n+m[key],0));
 for(const l of c.lines){assert.equal(l.buy,Math.max(0,l.need-(demoStock[l.id]||0)));assert.equal(l.used,Math.min(l.need,demoStock[l.id]||0));assert.equal(l.min,l.buy*ingredients[l.id].price[0]);assert.equal(l.max,l.buy*ingredients[l.id].price[1]);}
 assert.ok(c.max<=p.budget);
});
test('scaled portions exactly scale total ingredients',()=>{
 const p=generate({...defaultForm,people:1},{},defaultPrefs).plan;
 const a=calculate(p),b=calculate({...p,people:4});assert.equal(a.max*4,b.max);
 for(let i=0;i<a.lines.length;i++)assert.equal(a.lines[i].need*4,b.lines[i].need);
});
test('mandatory allergens and animal products are filtered',()=>{
 const prefs={...defaultPrefs,allergies:['Telur','Gluten'],diet:'Vegan'};
 const result=generate({...defaultForm,days:7,budget:1000000},demoStock,prefs);
 assert.ok(!result.error);for(const id of result.plan.menu.flat())assert.ok(allowed(recipes.find(r=>r.id===id),prefs));
});
test('avoiding all rice makes the catalogue infeasible without relaxing restrictions',()=>{
 assert.equal(generate(defaultForm,{}, {...defaultPrefs,avoided:['beras']}).error,'restrictions');
});
test('tiny budget is marked infeasible and the alternative remains over budget',()=>{
 const result=generate({...defaultForm,budget:1},demoStock,defaultPrefs);
 assert.equal(result.feasible,false);assert.ok(calculate(result.cheapest,demoStock).max>1);
});
test('minimum-cost search matches exhaustive two-day enumeration',()=>{
 const form={...defaultForm,days:2},result=generate(form,demoStock,defaultPrefs);
 const options=[0,1,2].map(s=>recipes.filter(r=>r.slot===s).map(r=>r.id));
 let min=Infinity;for(const a of options[0])for(const b of options[1])for(const c of options[2])for(const d of options[0])for(const e of options[1])for(const f of options[2])min=Math.min(min,calculate({...form,menu:[[a,b,c],[d,e,f]]},demoStock).max);
 assert.equal(calculate(result.cheapest,demoStock).max,min);
});
test('surplus pantry cannot make purchases negative',()=>{
 const stock=Object.fromEntries(Object.keys(ingredients).map(id=>[id,100000]));
 const c=calculate(generate(defaultForm,stock,defaultPrefs).plan,stock);assert.equal(c.min,0);assert.equal(c.max,0);assert.ok(c.lines.every(l=>l.buy===0));
});
test('all durations produce exactly three meals daily',()=>{
 for(let days=1;days<=7;days++){const result=generate({...defaultForm,days},demoStock,defaultPrefs);assert.equal(result.plan.menu.length,days);assert.ok(result.plan.menu.every(day=>day.length===3));}
});

test('fractional pantry quantities preserve integer Rupiah totals',()=>{
 const stock={beras:175.13,wortel:33.33,minyak:3.17};
 const c=calculate(generate(defaultForm,stock,defaultPrefs).plan,stock);
 for(const key of ['min','max']){assert.ok(Number.isInteger(c[key]));assert.equal(c[key],c.meals.reduce((n,m)=>n+m[key],0));assert.equal(c[key],c.lines.reduce((n,l)=>n+l[key],0));}
 for(const l of c.lines){assert.equal(l.min,Math.round(l.buy*ingredients[l.id].price[0]));assert.equal(l.max,Math.round(l.buy*ingredients[l.id].price[1]));}
});
