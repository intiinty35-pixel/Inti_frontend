import test from "node:test";
import assert from "node:assert/strict";
import { apartmentCode, apartmentGroupCodes, apartmentBlockFrame, resizeApartmentBlock, alignFloorApartments, duplicateApartment, duplicateFloor, buildingMapPlan, floorPolygonValid, modelApartmentGroup, resolveFloorImage, snapApartmentPath } from "../src/shared/lib/apartment-plan.ts";

test("resizing a rotated apartment block keeps shared walls and the opposite corner fixed",()=>{
  const point=(x,y)=>({x:.2+x*.12-y*.04,y:.2+x*.04+y*.12});
  const paths=Array.from({length:6},(_,i)=>{const x=i%3,y=Math.floor(i/3);return[point(x,y),point(x+1,y),point(x+1,y+1),point(x,y+1)];});
  const before=structuredClone(paths),frame=apartmentBlockFrame(paths,1);
  const target={x:frame.corners[2].x+.08,y:frame.corners[2].y+.04};
  const next=resizeApartmentBlock(paths,2,target,1),after=apartmentBlockFrame(next,1);
  assert.deepEqual(paths,before);
  assert.ok(Math.hypot(after.corners[0].x-frame.corners[0].x,after.corners[0].y-frame.corners[0].y)<1e-9);
  assert.ok(Math.hypot(after.corners[2].x-target.x,after.corners[2].y-target.y)<1e-9);
  assert.equal(new Set(next.flat().map(p=>`${p.x.toFixed(8)}:${p.y.toFixed(8)}`)).size,12);
  next.forEach(path=>assert.equal(floorPolygonValid(path),true));
  assert.deepEqual(resizeApartmentBlock(paths,2,{x:2,y:2},1),paths);
});

test("floor alignment restores shared edges on a rotated two-row grid and preserves apartment records", () => {
  const point=(col,row)=>({x:.2+col*.12-row*.04,y:.15+col*.04+row*.12});
  const paths=Array.from({length:10},(_,i)=>{const col=i%5,row=Math.floor(i/5);const x=i===0?0:col*.97,y=i===0?0:row*.95;return[point(x,y),point(x+1,y),point(x+1,y+1),point(x,y+1)];});
  const apartments=paths.map((path,i)=>({...unit,id:`unit-${i}`,code:`50${i+1}`,price:1000+i,path}));
  const floor={id:"floor",number:5,name:"Piso 5",apartments};
  const result=alignFloorApartments(floor,"unit-0",1);
  assert.equal(result.length,10);
  result.forEach((apartment,i)=>{
    assert.equal(apartment.id,apartments[i].id);assert.equal(apartment.code,apartments[i].code);assert.equal(apartment.price,apartments[i].price);assert.equal(apartment.areaM2,apartments[i].areaM2);
    const col=i%5,row=Math.floor(i/5),expected=[point(col,row),point(col+1,row),point(col+1,row+1),point(col,row+1)];
    apartment.path.forEach((p,j)=>assert.ok(Math.hypot(p.x-expected[j].x,p.y-expected[j].y)<1e-9));
  });
  assert.deepEqual(floor.apartments[1].path,paths[1]);
  const vertices=new Set(result.flatMap(a=>a.path.map(p=>`${p.x.toFixed(8)}:${p.y.toFixed(8)}`)));
  assert.equal(vertices.size,18);
  assert.throws(()=>alignFloorApartments({...floor,apartments:[{...apartments[0],path:paths[0].slice(0,3)}]},"unit-0"));
});

test("moving apartments snap small gaps to adjacent edges without changing dimensions", () => {
  const rectangle=(x,y)=>[{x,y},{x:x+.2,y},{x:x+.2,y:y+.2},{x,y:y+.2}];
  const neighbor=rectangle(.1,.1), moving=rectangle(.307,.1);
  const result=snapApartmentPath(moving,[neighbor],.015,.7);
  assert.ok(Math.abs(result[0].x-.3)<1e-9);
  result.forEach((p,i)=>{assert.ok(Math.abs((p.x-result[0].x)-(moving[i].x-moving[0].x))<1e-9);assert.ok(Math.abs((p.y-result[0].y)-(moving[i].y-moving[0].y))<1e-9);});
  const distant=rectangle(.5,.1);
  assert.deepEqual(snapApartmentPath(distant,[neighbor],.015),distant);
  const overlap=rectangle(.105,.1);
  assert.deepEqual(snapApartmentPath(overlap,[neighbor],.015),overlap);
  const below=rectangle(.1,.306);
  assert.ok(Math.abs(snapApartmentPath(below,[neighbor],.015)[0].y-.3)<1e-9);
});

test("directional apartment copies preserve manual shape and data with independent ids and numbering", () => {
  const original = { ...unit, code: "S1-01", path: [{x:.3,y:.3},{x:.4,y:.3},{x:.4,y:.35},{x:.35,y:.35},{x:.35,y:.4},{x:.3,y:.4}] };
  const floor = { id:"floor", number:-1, name:"Sótano", apartments:[original,{...original,id:crypto.randomUUID(),code:"S1-02"}] };
  for (const [direction,dx,dy] of [["LEFT",-.1,0],["RIGHT",.1,0],["UP",0,-.1],["DOWN",0,.1]]) {
    const copy = duplicateApartment(floor,original,direction);
    assert.equal(copy.code,"S1-03"); assert.notEqual(copy.id,original.id); assert.equal(copy.status,"AVAILABLE");
    for (const field of ['areaM2','price','operation','maintenanceFee','bedrooms','bathrooms','notes']) assert.equal(copy[field],original[field]);
    copy.path.forEach((p,i)=>{assert.ok(Math.abs(p.x-original.path[i].x-dx)<1e-9);assert.ok(Math.abs(p.y-original.path[i].y-dy)<1e-9);});
    copy.path[0].x=0;assert.equal(original.path[0].x,.3);
  }
  const edge={...original,path:original.path.map(p=>({x:p.x-.3,y:p.y}))};
  assert.throws(()=>duplicateApartment({...floor,apartments:[edge]},edge,"LEFT"),/fuera/);
});

test("copies of rotated apartments share a complete side without bounding-box gaps", () => {
  const a={x:.4,y:.3},u={x:.12,y:.06},v={x:-.05,y:.1};
  const source={...unit,path:[a,{x:a.x+u.x,y:a.y+u.y},{x:a.x+u.x+v.x,y:a.y+u.y+v.y},{x:a.x+v.x,y:a.y+v.y}]};
  const floor={id:"floor",number:1,name:"Piso 1",apartments:[source],image:{url:"plan",width:1000,height:1000}};
  for(const direction of ['LEFT','RIGHT','UP','DOWN']){
    const copy=duplicateApartment(floor,source,direction);
    const shared=copy.path.filter(p=>source.path.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<1e-9));
    assert.equal(shared.length,2);
    assert.equal(copy.areaM2,source.areaM2);
  }
});

test("apartment groups include and preserve the first model and repeat its orientation", () => {
  const contour = [{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}];
  const model = [{x:.1,y:.1},{x:.3,y:.1},{x:.3,y:.5},{x:.1,y:.5}];
  for (const count of [1, 4, 6, 10]) {
    const units = modelApartmentGroup(contour, model, count, .7);
    assert.equal(units.length, count);
    assert.deepEqual(units[0], model);
    for (const unit of units) {
      assert.equal(unit.length, 4);
      assert.equal(floorPolygonValid(unit), true);
      unit.forEach(p => assert.ok(p.x >= .1-1e-8 && p.x <= .9+1e-8 && p.y >= .1-1e-8 && p.y <= .9+1e-8));
    }
    for (let i=0;i<units.length;i++) for(let j=i+1;j<units.length;j++) {
      const bounds = p => ({left:Math.min(...p.map(q=>q.x)),right:Math.max(...p.map(q=>q.x)),top:Math.min(...p.map(q=>q.y)),bottom:Math.max(...p.map(q=>q.y))});
      const a=bounds(units[i]),b=bounds(units[j]);
      assert.ok(Math.min(a.right,b.right)-Math.max(a.left,b.left)<1e-8 || Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<1e-8);
    }
  }
  assert.throws(()=>modelApartmentGroup(contour, model.slice(0,3),4));
});
import { distributeFloorGroup } from "../src/shared/lib/site-plan.ts";
import { cropPlan, restorePlanCrop, recalibratePlan, resizePlanDrawing, imageToGeo, geoToImage, floorBuildingOutline, floorApartmentMapPlan } from "../src/shared/lib/plan-coordinates.ts";

test("public map projects only the selected floor's apartments onto the calibrated base",()=>{
  const image={url:"base.png",center:{lat:-3.55,lng:-80.42},widthM:150,heightM:100,rotation:37,opacity:1};
  const path=[{x:.2,y:.2},{x:.4,y:.2},{x:.4,y:.6},{x:.2,y:.6}];
  const apartment={...unit,path};
  const floor={id:"floor",number:1,name:"Piso 1",imageSource:"BASE",image:{url:image.url,width:1000,height:700},apartments:[apartment]};
  const building={id:"building",name:"Torre A",path:path.map(p=>imageToGeo(p,image)),floors:[floor,{...floor,id:"other-floor",apartments:[{...apartment,id:"other-unit"}]}]};
  const plan={image,buildings:[building],zones:[],lots:[]};
  const cropped=cropPlan(plan,{left:.1,top:.1,right:.9,bottom:.9});
  const result=floorApartmentMapPlan(cropped,building,floor);
  assert.equal(result.lots.length,1);assert.equal(result.lots[0].id,apartment.id);
  result.lots[0].path.forEach((p,i)=>assert.ok(Math.hypot(p.lat-building.path[i].lat,p.lng-building.path[i].lng)<1e-9));
  assert.equal(result.lots[0].areaM2,apartment.areaM2);assert.equal(result.lots[0].price,apartment.price);
  assert.equal(result.zones[0].id,building.id);
  assert.equal(floorApartmentMapPlan(plan,building,{...floor,imageSource:"CUSTOM"}).lots.length,0);
});

test("resizing existing drawings preserves image, data and floor interiors while fitting rotated sheets", () => {
  const image = { url: "base.png", center: { lat: -3.55, lng: -80.42 }, widthM: 150, heightM: 100, rotation: 37, opacity: 1 };
  const path = [{ x: -2, y: -1 }, { x: 3, y: -1 }, { x: 3, y: 2 }, { x: -2, y: 2 }].map(p => imageToGeo(p, image));
  const floor = { id: "floor", number: 1, name: "Piso 1", apartments: [unit] };
  const plan = { image, zones: [{ id: "street", kind: "STREET", name: "Calle", path }], lots: [], buildings: [{ id: "tower", name: "Torre", path, floors: [floor] }] };
  const half = resizePlanDrawing(plan, .5);
  const before = geoToImage(path[0], image), after = geoToImage(half.zones[0].path[0], image);
  assert.ok(Math.abs((after.x - .5) / (before.x - .5) - .5) < 1e-8);
  const fitted = resizePlanDrawing(plan, "FIT");
  fitted.zones[0].path.forEach(p => { const uv = geoToImage(p, image); assert.ok(uv.x >= .049999 && uv.x <= .950001 && uv.y >= .049999 && uv.y <= .950001); });
  assert.equal(fitted.image, image);
  assert.equal(fitted.buildings[0].floors[0], floor);
  assert.equal(fitted.zones[0].id, "street");
  assert.deepEqual(fitted.zones[0].path, fitted.buildings[0].path);
  assert.throws(() => resizePlanDrawing(plan, 0));
});

test("floors inherit the calibrated building outline across rotation, crop and alignment", () => {
  const image = { url: "base.png", center: { lat: -3.55, lng: -80.42 }, widthM: 150, heightM: 100, rotation: 37, opacity: 1 };
  const outline = [{ x: .2, y: .3 }, { x: .7, y: .3 }, { x: .7, y: .8 }, { x: .2, y: .8 }];
  const building = { id: "tower", name: "Torre", path: outline.map(p => imageToGeo(p, image)), floors: [] };
  const floor = { id: "floor", number: 1, name: "Piso 1", apartments: [], imageSource: "BASE", image: { url: image.url, width: 1000, height: 1000 * 100 / 150 } };
  const plan = { image, buildings: [building], zones: [], lots: [] };
  const check = result => result.forEach((p, i) => { assert.ok(Math.abs(p.x - outline[i].x) < 1e-8); assert.ok(Math.abs(p.y - outline[i].y) < 1e-8); });
  check(floorBuildingOutline(plan, building, floor));
  const cropped = cropPlan(plan, { left: .1, top: .1, right: .9, bottom: .9 });
  check(floorBuildingOutline(cropped, cropped.buildings[0], floor));
  const moved = recalibratePlan(cropped, { ...cropped.image, rotation: 72, center: { lat: -3.56, lng: -80.43 } });
  check(floorBuildingOutline(moved, moved.buildings[0], floor));
  assert.deepEqual(floor.apartments, []);
  assert.deepEqual(floorBuildingOutline(plan, building, { ...floor, imageSource: "CUSTOM", image: { ...floor.image, url: "other.png" } }), []);
});

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
      assert.equal(path.length, 4);
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
  for (const irregular of [contour.slice(0,3), [{x:.1,y:.1},{x:.9,y:.1},{x:.7,y:.9},{x:.1,y:.9}]]) {
    const units = distributeFloorGroup(irregular, 4);
    assert.equal(units.length, 4);
    units.forEach(unit => { assert.equal(unit.length, 4); assert.equal(floorPolygonValid(unit), true); });
  }
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
