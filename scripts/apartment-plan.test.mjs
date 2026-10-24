import test from "node:test";
import assert from "node:assert/strict";
import { apartmentCode, apartmentGroupCodes, duplicateFloor, buildingMapPlan, floorPolygonValid, resolveFloorImage } from "../src/shared/lib/apartment-plan.ts";
import { distributeFloorGroup } from "../src/shared/lib/site-plan.ts";
import { cropPlan, restorePlanCrop, recalibratePlan, imageToGeo, geoToImage } from "../src/shared/lib/plan-coordinates.ts";

const path = [{ x: .1, y: .1 }, { x: .45, y: .1 }, { x: .45, y: .8 }, { x: .1, y: .8 }];
const unit = { id: crypto.randomUUID(), code: "301", areaM2: 85, price: 2500, operation: "RENT", status: "RENTED", maintenanceFee: 180, bedrooms: 3, bathrooms: 2, notes: "Balcón", path };
test("duplicating a typical floor creates independent available units and preserves commercial data", () => {
  const source = { id: crypto.randomUUID(), number: 3, name: "Piso 3", image: { url: "plan.png", width: 1000, height: 700 }, apartments: [unit, { ...unit, id: crypto.randomUUID(), code: "302" }] };
  const cloned = duplicateFloor(source, 4);
  assert.notEqual(cloned.id, source.id);
  assert.equal(cloned.name, "Piso 4");
  assert.deepEqual(cloned.apartments.map(a => a.code), ["401", "402"]);
  cloned.apartments.forEach((a, i) => {
    assert.notEqual(a.id, source.apartments[i].id);
    assert.equal(a.status, "AVAILABLE");
    assert.equal(a.operation, "RENT");
    assert.equal(a.price, 2500);
    assert.equal(a.maintenanceFee, 180);
  });
  cloned.apartments[0].path[0].x = .2;
  assert.equal(source.apartments[0].path[0].x, .1);
  assert.equal(source.apartments[0].status, "RENTED");
});
test("apartment numbers support basements, ground floor and upper floors", () => {
  assert.equal(apartmentCode(-1, 0), "S1-01");
  assert.equal(apartmentCode(0, 0), "001");
  assert.equal(apartmentCode(12, 5), "1206");
});
test("the geographic map contains building footprints and shared zones, independently from floor layouts", () => {
  const geographic = [{ lat: -12, lng: -77 }, { lat: -12, lng: -76.99 }, { lat: -12.01, lng: -77 }];
  const building = { id: crypto.randomUUID(), name: "Torre A", path: geographic, floors: [{ id: crypto.randomUUID(), number: 3, name: "Piso 3", apartments: [unit] }] };
  const original = { mode: "APARTMENTS", logoUrl: "", lots: [{ id: "old-lot" }], zones: [{ id: "street", kind: "STREET", name: "Acceso", path: geographic }], buildings: [building] };
  const result = buildingMapPlan(original);
  assert.deepEqual(result.lots, []);
  assert.equal(original.lots.length, 1);
  assert.deepEqual(result.zones.map(z => z.id), ["street", building.id]);
  assert.deepEqual(result.zones[1].path, geographic);
  assert.ok(!result.zones.some(z => z.id === unit.id));
});
test("floor drawing rejects out-of-bounds, degenerate and crossed apartment polygons", () => {
  assert.equal(floorPolygonValid(path), true);
  assert.equal(floorPolygonValid([...path].reverse()), true);
  for (const invalid of [path.slice(0,2), [path[0], path[2], path[1], path[3]], [{ x: -1, y: .1 }, ...path.slice(1)], [{ x: NaN, y: .1 }, ...path.slice(1)], [path[0], path[0], path[1]]]) assert.equal(floorPolygonValid(invalid), false);
});

test("general plan alignment moves buildings and streets together while keeping interior floor plans intact", () => {
  const image = { url: "plan.png", center: { lat: -12, lng: -77 }, widthM: 200, heightM: 140, rotation: 0, opacity: .7 };
  const normalized = [{ x: .1, y: .1 }, { x: .4, y: .1 }, { x: .4, y: .8 }, { x: .1, y: .8 }];
  const geographic = normalized.map(p => imageToGeo(p, image));
  const floors = [{ id: crypto.randomUUID(), number: 3, name: "Piso 3", image: { url: "floor.png", width: 1000, height: 700 }, apartments: [unit] }];
  const plan = { mode: "APARTMENTS", logoUrl: "", image, lots: [], zones: [{ id: "street", kind: "STREET", name: "Acceso", path: geographic }], buildings: [{ id: "tower", name: "Torre A", path: geographic, floors }] };
  const nextImage = { ...image, center: { lat: -12.1, lng: -77.1 }, widthM: 300, heightM: 180, rotation: 48 };
  const next = recalibratePlan(plan, nextImage);
  assert.equal(next.buildings[0].floors, floors);
  assert.equal(next.buildings[0].floors[0].apartments[0].price, 2500);
  assert.deepEqual(next.buildings[0].path, next.zones[0].path);
  next.buildings[0].path.forEach((p, i) => {
    const onPage = geoToImage(p, nextImage);
    assert.ok(Math.abs(onPage.x - normalized[i].x) < 1e-8);
    assert.ok(Math.abs(onPage.y - normalized[i].y) < 1e-8);
  });
  assert.equal(plan.image.rotation, 0);
  assert.deepEqual(plan.buildings[0].path, geographic);
  const transparent = recalibratePlan(plan, { ...image, opacity: .2 });
  assert.equal(transparent.buildings, plan.buildings);
  assert.equal(transparent.zones, plan.zones);
});

test("cropping a rotated plan preserves drawings, composes repeat crops and restores the original page", () => {
  const image = { url: "plan.png", center: { lat: -12, lng: -77 }, widthM: 200, heightM: 140, rotation: 37, opacity: .7, sourcePdfUrl: "original.pdf", sourcePdfPage: 2 };
  const geographic = [{ x: .3, y: .3 }, { x: .6, y: .3 }, { x: .6, y: .7 }].map(p => imageToGeo(p, image));
  const plan = { image, logoUrl: "", lots: [{ id: "lot", path: geographic }], zones: [{ id: "street", path: geographic }], buildings: [{ id: "tower", path: geographic, floors: [] }] };
  const cropped = cropPlan(plan, { left: .1, top: .2, right: .9, bottom: .8 });
  assert.equal(cropped.lots, plan.lots);
  assert.equal(cropped.zones, plan.zones);
  assert.equal(cropped.buildings, plan.buildings);
  assert.ok(Math.abs(cropped.image.widthM - 160) < 1e-8);
  assert.ok(Math.abs(cropped.image.heightM - 84) < 1e-8);
  assert.equal(cropped.image.sourcePdfUrl, image.sourcePdfUrl);
  const recropped = cropPlan(cropped, { left: .25, top: .25, right: .75, bottom: .75 });
  for (const [key, value] of Object.entries({ left: .3, top: .35, right: .7, bottom: .65 })) assert.ok(Math.abs(recropped.image.crop[key] - value) < 1e-8);
  const restored = restorePlanCrop(recropped);
  assert.equal(restored.image.crop, undefined);
  assert.equal(restored.image.url, image.url);
  assert.ok(Math.abs(restored.image.widthM - image.widthM) < 1e-8);
  assert.ok(Math.abs(restored.image.heightM - image.heightM) < 1e-8);
  assert.ok(Math.abs(restored.image.center.lat - image.center.lat) < 1e-8);
  assert.ok(Math.abs(restored.image.center.lng - image.center.lng) < 1e-8);
  assert.equal(restored.buildings, plan.buildings);
  assert.deepEqual(plan.image, image);
});

test("cropping rejects empty, reversed, out-of-bounds and too-small selections", () => {
  const plan = { image: { url: "plan.png", center: { lat: -12, lng: -77 }, widthM: 200, heightM: 140, rotation: 0, opacity: 1 }, logoUrl: "", lots: [], zones: [] };
  for (const crop of [{ left: .5, top: 0, right: .5, bottom: 1 }, { left: .8, top: 0, right: .2, bottom: 1 }, { left: -.1, top: 0, right: 1, bottom: 1 }, { left: 0, top: 0, right: NaN, bottom: 1 }, { left: 0, top: 0, right: .001, bottom: 1 }]) assert.throws(() => cropPlan(plan, crop));
  assert.equal(restorePlanCrop(plan), plan);
});

test("a floor contour generates exactly the requested department count with equal areas and configurable orientation", () => {
  const contour = [{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}];
  const area = polygon => Math.abs(polygon.reduce((n,p,i)=>{const q=polygon[(i+1)%polygon.length];return n+p.x*q.y-q.x*p.y;},0))/2;
  for (const count of [1,2,3,4,6,9]) for (const layout of ['AUTO','COLUMNS','ROWS']) {
    const groups = distributeFloorGroup(contour,count,layout,.7);
    assert.equal(groups.length,count);
    for(const path of groups){
      assert.equal(floorPolygonValid(path),true);
      assert.ok(Math.abs(area(path)-.64/count)<1e-7);
      path.forEach(p=>assert.ok(p.x>=.1-1e-7&&p.x<=.9+1e-7&&p.y>=.1-1e-7&&p.y<=.9+1e-7));
      if(layout==='COLUMNS')assert.ok(Math.abs(Math.max(...path.map(p=>p.y))-Math.min(...path.map(p=>p.y))-.8)<1e-7);
      if(layout==='ROWS')assert.ok(Math.abs(Math.max(...path.map(p=>p.x))-Math.min(...path.map(p=>p.x))-.8)<1e-7);
    }
  }
  assert.throws(()=>distributeFloorGroup(contour,0));
  assert.throws(()=>distributeFloorGroup(contour,2.5));
  assert.throws(()=>distributeFloorGroup(contour,101));
});

test("department group numbering respects the chosen first code including basement prefixes",()=>{
  assert.deepEqual(apartmentGroupCodes('301',3),['301','302','303']);
  assert.deepEqual(apartmentGroupCodes('S1-01',2),['S1-01','S1-02']);
  assert.throws(()=>apartmentGroupCodes('',3));
  assert.throws(()=>apartmentGroupCodes('A',3));
});

test("floors reuse the same base asset and a replacement stays local to its floor",()=>{
  const image={url:'general.png',widthM:200,heightM:140,crop:{left:.1,top:.2,right:.9,bottom:.8}};
  const plan={image,lots:[],zones:[],logoUrl:''};
  const first={id:'floor-1',name:'Piso 1',number:1,apartments:[]};
  const base=resolveFloorImage(plan,first);
  assert.equal(base.url,image.url);assert.equal(base.width,1000);assert.equal(base.height,700);assert.deepEqual(base.crop,image.crop);
  first.image=base;first.imageSource='BASE';
  const second=duplicateFloor(first,2);
  second.image={url:'piso-2.png',width:900,height:600};second.imageSource='CUSTOM';
  assert.equal(resolveFloorImage(plan,first).url,'general.png');
  assert.equal(resolveFloorImage(plan,second).url,'piso-2.png');
  assert.equal(plan.image.url,'general.png');
  const changedGeneral={...plan,image:{...image,url:'new-general.png'}};
  assert.equal(resolveFloorImage(changedGeneral,first).url,'general.png');
});
