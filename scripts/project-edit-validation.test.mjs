import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier,context,nextResolve) {
  return nextResolve(specifier.startsWith('@/') ? new URL(`../src/${specifier.slice(2)}.ts`,import.meta.url).href : specifier,context);
}});
const { createProjectDraftSchema,projectDraftSchema }=await import('../src/features/projects/lib/project-schema.ts');
const { PROJECT_DRAFT_DEFAULTS }=await import('../src/features/projects/lib/project-draft.ts');
const { PROJECT_AMENITIES }=await import('../src/features/projects/data/project-catalogs.ts');
const draft=()=>({...structuredClone(PROJECT_DRAFT_DEFAULTS),name:'Proyecto de prueba',description:'Descripción de un proyecto de lotización para verificar la edición segura de su dirección.',department:'Lima',province:'Lima',district:'Lima',lat:-12,lng:-77,priceFrom:10000,priceTo:20000,estimatedDelivery:'2027-12-31',amenities:[PROJECT_AMENITIES[0].value],keptMedia:[{id:'cover',type:'IMAGE',url:'https://res.cloudinary.com/test/image/upload/cover.jpg',order:0,isCover:true}],lots:[]});

test('editing general data with site-plan inventory does not require rebuilding the hidden lots step',()=>{
  const value=draft();value.street='Dirección corregida';
  const result=createProjectDraftSchema({managedInventory:true}).safeParse(value);
  assert.equal(result.success,true,JSON.stringify(result.error?.issues));
  assert.equal(result.data.street,'Dirección corregida');
  assert.deepEqual(result.data.lots,[]);
  const ordinary=projectDraftSchema.safeParse(value);
  assert.equal(ordinary.success,false);
  assert.ok(ordinary.error.issues.some(issue=>issue.path[0]==='lots'));
});
test('managed inventory accepts existing zero-price records but still validates the address',()=>{
  const value=draft();value.lots=[{lotNumber:'L-01',areaM2:120,price:0,status:'disponible'}];
  assert.equal(createProjectDraftSchema({managedInventory:true}).safeParse(value).success,true);
  value.lat=NaN;
  const result=createProjectDraftSchema({managedInventory:true}).safeParse(value);
  assert.equal(result.success,false);
  assert.ok(result.error.issues.some(issue=>issue.path[0]==='lat'));
});
test('apartment creation does not require legacy lot inventory',()=>{
  assert.equal(projectDraftSchema.safeParse({...draft(),category:'departamentos'}).success,true);
});
