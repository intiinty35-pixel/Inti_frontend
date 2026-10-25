import type { PlanCrop, PlanImage, PlanLot, Point, SitePlan } from "./site-plan";
import type { FloorPoint, PlanBuilding, PlanFloor } from "./apartment-plan";

/** Draw the selected floor's units in the same geographic frame as its shared base sheet. */
export function floorApartmentMapPlan(plan: SitePlan, building: PlanBuilding, floor?: PlanFloor): SitePlan {
  const base:SitePlan={...plan,lots:[],zones:[...plan.zones,...(plan.buildings??[]).map(b=>({id:b.id,name:b.name,path:b.path,kind:"BLOCK" as const}))]};
  const image=plan.image;
  if(!floor||!image||floor.imageSource==="CUSTOM"||(floor.image&&floor.image.url!==image.url))return base;
  const current=image.crop??{left:0,top:0,right:1,bottom:1};
  const source=floor.image?.crop??(floor.image?{left:0,top:0,right:1,bottom:1}:current);
  const toGeo=(p:FloorPoint)=>imageToGeo({x:(source.left+p.x*(source.right-source.left)-current.left)/(current.right-current.left),y:(source.top+p.y*(source.bottom-source.top)-current.top)/(current.bottom-current.top)},image);
  const lots:PlanLot[]=floor.apartments.map(a=>({id:a.id,code:a.code,block:building.name,street:floor.name,address:"",type:"Departamento",dimensions:"",areaM2:a.areaM2,perimeterM:0,frontM:0,price:a.price,priceM2:a.areaM2>0?a.price/a.areaM2:0,status:a.status==="RENTED"?"BLOCKED":a.status,cashAllowed:a.operation==="SALE",financingAllowed:false,financedPrice:0,downPayment:0,installments:0,monthlyPayment:a.operation==="RENT"?a.price:0,notes:a.notes,path:a.path.map(toGeo)}));
  return {...base,lots};
}

/** Resize existing geographic drawings together while leaving the image and floor interiors intact. */
export function resizePlanDrawing(plan: SitePlan, amount: number | "FIT"): SitePlan {
  const image = plan.image;
  if (!image) throw new Error("Carga primero el plano.");
  const points = [...plan.zones, ...plan.lots, ...(plan.buildings ?? [])].flatMap(shape => shape.path).map(point => geoToImage(point, image));
  if (points.length < 3 || points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error("No hay un dibujo válido para ajustar.");
  const left = Math.min(...points.map(p => p.x)), right = Math.max(...points.map(p => p.x));
  const top = Math.min(...points.map(p => p.y)), bottom = Math.max(...points.map(p => p.y));
  const factor = amount === "FIT" ? Math.min(.9 / (right - left), .9 / (bottom - top)) : amount;
  if (!Number.isFinite(factor) || factor <= 0) throw new Error("Revisa el tamaño del dibujo.");
  const center = { x: (left + right) / 2, y: (top + bottom) / 2 };
  const target = amount === "FIT" ? { x: .5, y: .5 } : center;
  const transform = (point: Point) => {
    const uv = geoToImage(point, image);
    return imageToGeo({ x: target.x + (uv.x - center.x) * factor, y: target.y + (uv.y - center.y) * factor }, image);
  };
  const next = { ...plan, zones: plan.zones.map(shape => ({ ...shape, path: shape.path.map(transform) })), lots: plan.lots.map(shape => ({ ...shape, path: shape.path.map(transform) })), buildings: plan.buildings?.map(shape => ({ ...shape, path: shape.path.map(transform) })) };
  if ([...next.zones, ...next.lots, ...(next.buildings ?? [])].some(shape => shape.path.some(p => !Number.isFinite(p.lat) || !Number.isFinite(p.lng) || Math.abs(p.lat) > 85 || Math.abs(p.lng) > 180))) throw new Error("El ajuste supera los límites del mapa.");
  return next;
}

/** Project the building outline onto the same sheet used by the selected floor. */
export function floorBuildingOutline(plan: SitePlan, building: PlanBuilding, floor: PlanFloor): FloorPoint[] {
  if (building.path.length < 3) return [];
  if (plan.image && floor.imageSource !== "CUSTOM" && (!floor.image || floor.image.url === plan.image.url)) {
    const current = plan.image.crop ?? { left: 0, top: 0, right: 1, bottom: 1 };
    const target = floor.image?.crop ?? (floor.image ? { left: 0, top: 0, right: 1, bottom: 1 } : current);
    return building.path.map(point => {
      const uv = geoToImage(point, plan.image!);
      return {
        x: (current.left + uv.x * (current.right - current.left) - target.left) / (target.right - target.left),
        y: (current.top + uv.y * (current.bottom - current.top) - target.top) / (target.bottom - target.top),
      };
    });
  }
  // A custom sheet has no geographic calibration. Do not invent an alignment.
  if (floor.image) return [];
  const minLng = Math.min(...building.path.map(p => p.lng)), maxLng = Math.max(...building.path.map(p => p.lng));
  const minLat = Math.min(...building.path.map(p => p.lat)), maxLat = Math.max(...building.path.map(p => p.lat));
  if (maxLng === minLng || maxLat === minLat) return [];
  return building.path.map(p => ({ x: .05 + .9 * (p.lng - minLng) / (maxLng - minLng), y: .05 + .9 * (maxLat - p.lat) / (maxLat - minLat) }));
}

/** Crop the displayed asset without changing the geographic position of existing drawings. */
export function cropPlan(plan: SitePlan, selection: PlanCrop): SitePlan {
  const image = plan.image;
  if (!image) throw new Error("Carga primero el plano.");
  const { left, top, right, bottom } = selection;
  if (Object.values(selection).some(n => !Number.isFinite(n) || n < 0 || n > 1) || right <= left || bottom <= top)
    throw new Error("Selecciona un área de recorte válida dentro de la hoja.");
  const widthM = image.widthM * (right - left), heightM = image.heightM * (bottom - top);
  if (widthM < 1 || heightM < 1) throw new Error("El recorte es demasiado pequeño. Conserva al menos un metro de ancho y alto.");
  const previous = image.crop ?? { left: 0, top: 0, right: 1, bottom: 1 };
  const crop = {
    left: previous.left + left * (previous.right - previous.left),
    top: previous.top + top * (previous.bottom - previous.top),
    right: previous.left + right * (previous.right - previous.left),
    bottom: previous.top + bottom * (previous.bottom - previous.top),
  };
  return { ...plan, image: { ...image, crop, widthM, heightM, center: imageToGeo({ x: (left + right) / 2, y: (top + bottom) / 2 }, image) } };
}

export function restorePlanCrop(plan: SitePlan): SitePlan {
  const image = plan.image;
  if (!image?.crop) return plan;
  const { left, top, right, bottom } = image.crop;
  const widthM = image.widthM / (right - left), heightM = image.heightM / (bottom - top);
  if (widthM > 100000 || heightM > 100000) throw new Error("Reduce la escala del plano antes de restaurar la hoja completa.");
  return { ...plan, image: { ...image, crop: undefined, widthM, heightM, center: imageToGeo({ x: (.5 - left) / (right - left), y: (.5 - top) / (bottom - top) }, image) } };
}

/** Keep every geographic drawing attached to the general plan during alignment. */
export function recalibratePlan(plan: SitePlan, image: PlanImage): SitePlan {
  const previous = plan.image;
  if (!previous || previous.url !== image.url || (previous.center.lat === image.center.lat && previous.center.lng === image.center.lng && previous.widthM === image.widthM && previous.heightM === image.heightM && previous.rotation === image.rotation)) return { ...plan, image };
  const transform = (p: Point) => imageToGeo(geoToImage(p, previous), image);
  return {
    ...plan, image,
    lots: plan.lots.map(lot => ({ ...lot, path: lot.path.map(transform) })),
    zones: plan.zones.map(zone => ({ ...zone, path: zone.path.map(transform) })),
    ...(plan.buildings ? { buildings: plan.buildings.map(building => ({ ...building, path: building.path.map(transform) })) } : {}),
  };
}

/** Place a specific point of the drawing at the target, rather than the image's whitespace center. */
export function placeImageAnchor(image: PlanImage, anchor: Point, target: Point): PlanImage {
  const uv = geoToImage(anchor, image);
  const first = imageToGeo(uv, { ...image, center: target });
  const lat = target.lat - (first.lat - target.lat);
  const next = imageToGeo(uv, { ...image, center: { lat, lng: target.lng } });
  return { ...image, center: { lat, lng: target.lng - (next.lng - target.lng) } };
}

/** Normalized image coordinates share the same geographic calibration as the map overlay. */
export function imageToGeo(
  point: { x: number; y: number },
  image: PlanImage,
): Point {
  const x = (point.x - 0.5) * image.widthM;
  const y = (0.5 - point.y) * image.heightM;
  const angle = (image.rotation * Math.PI) / 180;
  const east = x * Math.cos(angle) + y * Math.sin(angle);
  const north = -x * Math.sin(angle) + y * Math.cos(angle);
  return {
    lat: image.center.lat + north / 111320,
    lng:
      image.center.lng +
      east / (111320 * Math.cos((image.center.lat * Math.PI) / 180)),
  };
}

export function geoToImage(point: Point, image: PlanImage) {
  const east =
    (point.lng - image.center.lng) *
    111320 *
    Math.cos((image.center.lat * Math.PI) / 180);
  const north = (point.lat - image.center.lat) * 111320;
  const angle = (image.rotation * Math.PI) / 180;
  const x = east * Math.cos(angle) - north * Math.sin(angle);
  const y = east * Math.sin(angle) + north * Math.cos(angle);
  return { x: x / image.widthM + 0.5, y: 0.5 - y / image.heightM };
}
