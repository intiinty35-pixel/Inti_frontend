import type { PlanCrop, Point, SitePlan } from "./site-plan";

export type FloorPoint = { x: number; y: number };

export function apartmentBlockFrame(paths: FloorPoint[][], aspect = 1) {
  const points=paths.flat();
  if(!points.length||!Number.isFinite(aspect)||aspect<=0)return undefined;
  const first=paths.find(path=>path.length>=2);
  if(!first)return undefined;
  const dx=first[1].x-first[0].x,dy=(first[1].y-first[0].y)*aspect,length=Math.hypot(dx,dy);
  if(length<1e-10)return undefined;
  const u={x:dx/length,y:dy/length},v={x:-dy/length,y:dx/length};
  const project=(p:FloorPoint)=>({x:p.x*u.x+p.y*aspect*u.y,y:p.x*v.x+p.y*aspect*v.y});
  const restore=(p:FloorPoint)=>({x:p.x*u.x+p.y*v.x,y:(p.x*u.y+p.y*v.y)/aspect});
  const local=points.map(project),left=Math.min(...local.map(p=>p.x)),right=Math.max(...local.map(p=>p.x)),top=Math.min(...local.map(p=>p.y)),bottom=Math.max(...local.map(p=>p.y));
  return {project,restore,left,right,top,bottom,corners:[{x:left,y:top},{x:right,y:top},{x:right,y:bottom},{x:left,y:bottom}].map(restore)};
}

/** Resize all interior polygons in the same rotated frame so their shared edges stay shared. */
export function resizeApartmentBlock(paths: FloorPoint[][], corner: number, target: FloorPoint, aspect = 1): FloorPoint[][] {
  const frame=apartmentBlockFrame(paths,aspect);
  if(!frame||corner<0||corner>3)return paths;
  const point=frame.project(target),opposite=frame.project(frame.corners[(corner+2)%4]);
  const fromLeft=corner===0||corner===3,fromTop=corner===0||corner===1;
  const left=fromLeft?Math.min(point.x,opposite.x-.0001):opposite.x,right=fromLeft?opposite.x:Math.max(point.x,opposite.x+.0001);
  const top=fromTop?Math.min(point.y,opposite.y-.0001):opposite.y,bottom=fromTop?opposite.y:Math.max(point.y,opposite.y+.0001);
  if(frame.right-frame.left<1e-8||frame.bottom-frame.top<1e-8)return paths;
  const next=paths.map(path=>path.map(p=>{const q=frame.project(p);return frame.restore({x:left+(q.x-frame.left)/(frame.right-frame.left)*(right-left),y:top+(q.y-frame.top)/(frame.bottom-frame.top)*(bottom-top)});}));
  return next.some(path=>path.some(p=>p.x<0||p.x>1||p.y<0||p.y>1))?paths:next;
}

/** Magnetize a moving apartment to neighboring edges without resizing either polygon. */
export function snapApartmentPath(path: FloorPoint[], neighbors: FloorPoint[][], tolerance: number, aspect = 1): FloorPoint[] {
  if (!path.length || tolerance <= 0 || !Number.isFinite(tolerance) || !Number.isFinite(aspect) || aspect <= 0) return path;
  const project = (p: FloorPoint) => ({ x:p.x,y:p.y*aspect });
  const moving=path.map(project), polygons=neighbors.filter(p=>p.length>=3).map(p=>p.map(project));
  const candidates: {x:number;y:number;distance:number}[]=[];
  const add=(a:FloorPoint,b:FloorPoint)=>{const x=b.x-a.x,y=b.y-a.y,distance=Math.hypot(x,y);if(distance<=tolerance)candidates.push({x,y,distance});};
  const nearest=(p:FloorPoint,a:FloorPoint,b:FloorPoint)=>{const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/length)):0;return{x:a.x+t*dx,y:a.y+t*dy};};
  for(const polygon of polygons)for(const p of moving)for(let i=0;i<polygon.length;i++) {
    add(p,polygon[i]);add(p,nearest(p,polygon[i],polygon[(i+1)%polygon.length]));
  }
  for(const polygon of polygons)for(const p of polygon)for(let i=0;i<moving.length;i++) {
    const q=nearest(p,moving[i],moving[(i+1)%moving.length]);add(q,p);
  }
  const cross=(a:FloorPoint,b:FloorPoint,c:FloorPoint)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const strictInside=(p:FloorPoint,polygon:FloorPoint[])=>{
    let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const a=polygon[j],b=polygon[i];
      if(Math.abs(cross(a,b,p))<1e-10&&p.x>=Math.min(a.x,b.x)-1e-10&&p.x<=Math.max(a.x,b.x)+1e-10&&p.y>=Math.min(a.y,b.y)-1e-10&&p.y<=Math.max(a.y,b.y)+1e-10)return false;
      if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
    }return inside;
  };
  const overlaps=(a:FloorPoint[],b:FloorPoint[])=>{
    const center=(p:FloorPoint[])=>p.reduce((sum,v)=>({x:sum.x+v.x/p.length,y:sum.y+v.y/p.length}),{x:0,y:0});
    if ((strictInside(center(a),a)&&strictInside(center(a),b))||(strictInside(center(b),b)&&strictInside(center(b),a))) return true;
    const samples=(p:FloorPoint[])=>[...p,...p.map((v,i)=>({x:(v.x+p[(i+1)%p.length].x)/2,y:(v.y+p[(i+1)%p.length].y)/2}))];
    if(samples(a).some(p=>strictInside(p,b))||samples(b).some(p=>strictInside(p,a)))return true;
    return a.some((p,i)=>b.some((r,j)=>{const q=a[(i+1)%a.length],s=b[(j+1)%b.length];return cross(p,q,r)*cross(p,q,s)<-1e-16&&cross(r,s,p)*cross(r,s,q)<-1e-16;}));
  };
  candidates.sort((a,b)=>a.distance-b.distance);
  for(const offset of candidates){
    const result=moving.map(p=>({x:p.x+offset.x,y:p.y+offset.y}));
    if(result.some(p=>p.x<0||p.x>1||p.y<0||p.y>aspect)||polygons.some(p=>overlaps(result,p)))continue;
    return result.map(p=>({x:p.x,y:p.y/aspect}));
  }
  return path;
}

/** Keep the first apartment and repeat its directions and proportions inside the group. */
export function modelApartmentGroup(boundary: FloorPoint[], model: FloorPoint[], count: number, aspect = 1): FloorPoint[][] {
  if (!floorPolygonValid(boundary) || !floorPolygonValid(model) || model.length !== 4 || !Number.isInteger(count) || count < 1 || count > 100 || !Number.isFinite(aspect) || aspect <= 0) throw new Error("Dibuja el contorno y el primer departamento con cuatro esquinas; indica entre 1 y 100 departamentos.");
  const [a, b, , d] = model;
  const u = { x: b.x - a.x, y: b.y - a.y }, v = { x: d.x - a.x, y: d.y - a.y };
  const determinant = u.x * v.y - u.y * v.x;
  if (Math.abs(determinant) < 1e-10) throw new Error("El departamento modelo debe tener ancho y fondo.");
  if (Math.hypot(model[2].x - b.x - d.x + a.x, model[2].y - b.y - d.y + a.y) > Math.min(Math.hypot(u.x,u.y),Math.hypot(v.x,v.y)) * .01) throw new Error("Para repetir por grupo dibuja el modelo con lados opuestos paralelos. Para una forma especial usa el dibujo individual.");
  const project = (p: FloorPoint) => ({ x: ((p.x - a.x) * v.y - (p.y - a.y) * v.x) / determinant, y: (u.x * (p.y - a.y) - u.y * (p.x - a.x)) / determinant });
  const restore = (p: FloorPoint) => ({ x: a.x + p.x * u.x + p.y * v.x, y: a.y + p.x * u.y + p.y * v.y });
  const polygon = boundary.map(project);
  const cross = (a: FloorPoint, b: FloorPoint, c: FloorPoint) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const inside = (p: FloorPoint) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[j], b = polygon[i];
      if (Math.abs(cross(a, b, p)) < 1e-8 && p.x >= Math.min(a.x,b.x)-1e-8 && p.x <= Math.max(a.x,b.x)+1e-8 && p.y >= Math.min(a.y,b.y)-1e-8 && p.y <= Math.max(a.y,b.y)+1e-8) return true;
      if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x) result = !result;
    }
    return result;
  };
  const contains = (rect: FloorPoint[]) => rect.every(inside) && rect.every((p,i) => {
    const q = rect[(i+1)%4];
    if (!inside({ x:(p.x+q.x)/2,y:(p.y+q.y)/2 })) return false;
    return polygon.every((r,j) => { const s=polygon[(j+1)%polygon.length]; return !(cross(p,q,r)*cross(p,q,s)<-1e-12 && cross(r,s,p)*cross(r,s,q)<-1e-12); });
  }) && !polygon.some(p => p.x > rect[0].x+1e-8 && p.x < rect[2].x-1e-8 && p.y > rect[0].y+1e-8 && p.y < rect[2].y-1e-8);
  const seed = [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}];
  if (!contains(seed)) throw new Error("Coloca el primer departamento dentro del contorno del grupo.");
  if (count === 1) return [model.map(p=>({...p}))];
  const left=Math.min(...polygon.map(p=>p.x)),right=Math.max(...polygon.map(p=>p.x)),top=Math.min(...polygon.map(p=>p.y)),bottom=Math.max(...polygon.map(p=>p.y));
  for (let attempt=0;attempt<18;attempt++) {
    const scale=Math.pow(.8,attempt), candidates: FloorPoint[][]=[];
    const minCol=Math.floor(left/scale),maxCol=Math.ceil(right/scale),minRow=Math.floor(top/scale),maxRow=Math.ceil(bottom/scale);
    if ((maxCol-minCol)*(maxRow-minRow)>200000) break;
    for(let row=minRow;row<maxRow;row++)for(let col=minCol;col<maxCol;col++) {
      const x=col*scale,y=row*scale;
      if(x<1-1e-8&&x+scale>1e-8&&y<1-1e-8&&y+scale>1e-8)continue;
      const rect=[{x,y},{x:x+scale,y},{x:x+scale,y:y+scale},{x,y:y+scale}];
      if(contains(rect))candidates.push(rect);
    }
    candidates.sort((p,q)=>Math.hypot(p[0].x,p[0].y)-Math.hypot(q[0].x,q[0].y)||p[0].y-q[0].y||p[0].x-q[0].x);
    if(candidates.length>=count-1)return [model.map(p=>({...p})),...candidates.slice(0,count-1).map(rect=>rect.map(restore))];
  }
  throw new Error("El primer departamento ocupa demasiado espacio. Redúcelo o amplía el contorno para distribuir los demás.");
}
export type ApartmentStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "BLOCKED";
export type PlanApartment = {
  id: string;
  code: string;
  areaM2: number;
  price: number;
  operation: "SALE" | "RENT";
  status: ApartmentStatus;
  maintenanceFee: number;
  bedrooms: number;
  bathrooms: number;
  notes: string;
  path: FloorPoint[];
};
export type PlanFloor = {
  id: string;
  number: number;
  name: string;
  image?: { url: string; width: number; height: number; crop?: PlanCrop };
  imageSource?: "BASE" | "CUSTOM";
  apartments: PlanApartment[];
};
export type PlanBuilding = { id: string; name: string; path: Point[]; floors: PlanFloor[] };

/** Align one floor on the selected apartment's rotated rectangular grid. */
export function alignFloorApartments(floor: PlanFloor, modelId: string, aspect = 1): PlanApartment[] {
  const model = floor.apartments.find(a => a.id === modelId);
  if (!model || !Number.isFinite(aspect) || aspect <= 0 || floor.apartments.some(a => a.path.length !== 4 || !floorPolygonValid(a.path))) throw new Error("Selecciona un departamento de cuatro esquinas. Esta alineación es para pisos con departamentos rectangulares.");
  const [a,b,c,d] = model.path.map(p=>({x:p.x,y:p.y*aspect}));
  const ux=((b.x-a.x)+(c.x-d.x))/2,uy=((b.y-a.y)+(c.y-d.y))/2;
  const width=Math.hypot(ux,uy),height=(Math.hypot(d.x-a.x,d.y-a.y)+Math.hypot(c.x-b.x,c.y-b.y))/2;
  if(width<1e-6||height<1e-6)throw new Error("El modelo debe tener ancho y fondo.");
  const sign=ux*(d.y-a.y)-uy*(d.x-a.x)>0?1:-1;
  const u={x:ux,y:uy},v={x:-uy/width*height*sign,y:ux/width*height*sign};
  const origin={x:(a.x+b.x+c.x+d.x)/4-(u.x+v.x)/2,y:(a.y+b.y+c.y+d.y)/4-(u.y+v.y)/2};
  const determinant=u.x*v.y-u.y*v.x;
  const project=(p:FloorPoint)=>({x:((p.x-origin.x)*v.y-(p.y*aspect-origin.y)*v.x)/determinant-.5,y:(u.x*(p.y*aspect-origin.y)-u.y*(p.x-origin.x))/determinant-.5});
  const polygon=(col:number,row:number)=>[{x:col,y:row},{x:col+1,y:row},{x:col+1,y:row+1},{x:col,y:row+1}].map(p=>({x:origin.x+p.x*u.x+p.y*v.x,y:(origin.y+p.x*u.y+p.y*v.y)/aspect}));
  const locations=floor.apartments.map(apartment=>{
    const center=apartment.path.reduce((sum,p)=>({x:sum.x+p.x/4,y:sum.y+p.y/4}),{x:0,y:0});
    const position=project(center);
    return {apartment,position};
  }).sort((p,q)=>p.apartment.id===modelId?-1:q.apartment.id===modelId?1:Math.hypot(p.position.x,p.position.y)-Math.hypot(q.position.x,q.position.y));
  const occupied=new Set<string>(),result=new Map<string,FloorPoint[]>();
  for(const {apartment,position} of locations){
    const col=Math.round(position.x),row=Math.round(position.y);
    const candidates=[];
    for(let dy=-floor.apartments.length;dy<=floor.apartments.length;dy++)for(let dx=-floor.apartments.length;dx<=floor.apartments.length;dx++){
      const x=col+dx,y=row+dy,key=`${x}:${y}`;
      if(occupied.has(key))continue;
      const path=polygon(x,y);
      if(path.some(p=>p.x<0||p.x>1||p.y<0||p.y>1))continue;
      candidates.push({x,y,key,path,distance:Math.hypot(x-position.x,y-position.y)});
    }
    candidates.sort((p,q)=>p.distance-q.distance||p.y-q.y||p.x-q.x);
    const chosen=candidates[0];
    if(!chosen)throw new Error("La distribución no cabe en la hoja con el tamaño del modelo. Reduce el modelo o ajusta la imagen antes de alinear.");
    occupied.add(chosen.key);result.set(apartment.id,chosen.path);
  }
  return floor.apartments.map(a=>({...a,path:result.get(a.id)!}));
}

export function duplicateApartment(floor: PlanFloor, source: PlanApartment, direction: "LEFT" | "RIGHT" | "UP" | "DOWN"): PlanApartment {
  if (!floorPolygonValid(source.path)) throw new Error("Completa el dibujo del departamento antes de duplicarlo.");
  const width = Math.max(...source.path.map(p => p.x)) - Math.min(...source.path.map(p => p.x));
  const height = Math.max(...source.path.map(p => p.y)) - Math.min(...source.path.map(p => p.y));
  let dx = direction === "LEFT" ? -width : direction === "RIGHT" ? width : 0;
  let dy = direction === "UP" ? -height : direction === "DOWN" ? height : 0;
  if (source.path.length === 4) {
    const [a,b,c,d] = source.path;
    const u = { x:b.x-a.x, y:b.y-a.y }, v = { x:d.x-a.x, y:d.y-a.y };
    if (Math.hypot(c.x-b.x-d.x+a.x,c.y-b.y-d.y+a.y) < Math.min(Math.hypot(u.x,u.y),Math.hypot(v.x,v.y)) * .01) {
      const aspect = (floor.image?.height ?? 700)/(floor.image?.width ?? 1000);
      const target = { x:direction === "LEFT" ? -1 : direction === "RIGHT" ? 1 : 0, y:direction === "UP" ? -1 : direction === "DOWN" ? 1 : 0 };
      const vectors = [u,v,{x:-u.x,y:-u.y},{x:-v.x,y:-v.y}];
      const score = (p: FloorPoint) => (p.x*target.x+p.y*aspect*target.y)/Math.hypot(p.x,p.y*aspect);
      vectors.sort((p,q)=>score(q)-score(p));
      dx=vectors[0].x; dy=vectors[0].y;
    }
  }
  const path = source.path.map(p => ({ x: p.x + dx, y: p.y + dy }));
  if (path.some(p => p.x < -1e-9 || p.x > 1+1e-9 || p.y < -1e-9 || p.y > 1+1e-9)) throw new Error("La copia queda fuera de la hoja. Elige otra dirección o ajusta el dibujo.");
  const existing = new Set(floor.apartments.map(a => a.code.trim().toLowerCase()));
  const match = source.code.trim().match(/^(.*?)(\d+)$/);
  let index = 1, code: string;
  do {
    code = match && Number.isSafeInteger(Number(match[2]) + index) ? `${match[1]}${String(Number(match[2]) + index).padStart(match[2].length, "0")}` : apartmentCode(floor.number, floor.apartments.length + index - 1);
    index++;
  } while (existing.has(code.toLowerCase()));
  if (code.length > 80) throw new Error("Acorta el código del departamento antes de duplicarlo.");
  return { ...source, id: crypto.randomUUID(), code, status: "AVAILABLE", path: path.map(p => ({ x: Math.max(0, Math.min(1,p.x)), y: Math.max(0, Math.min(1,p.y)) })) };
}

export const APARTMENT_STATUS_LABELS: Record<ApartmentStatus, string> = {
  AVAILABLE: "Disponible", RESERVED: "Separado", SOLD: "Vendido", RENTED: "Alquilado", BLOCKED: "Bloqueado",
};
export const APARTMENT_STATUS_COLORS: Record<ApartmentStatus, string> = {
  AVAILABLE: "#059669", RESERVED: "#d97706", SOLD: "#dc2626", RENTED: "#7c3aed", BLOCKED: "#64748b",
};
export const apartmentCode = (floor: number, index: number) => `${floor < 0 ? `S${Math.abs(floor)}-` : floor}${String(index + 1).padStart(2, "0")}`;

export function resolveFloorImage(plan: SitePlan, floor: PlanFloor): PlanFloor["image"] {
  if (floor.image) return floor.image;
  if (!plan.image) return undefined;
  return { url: plan.image.url, width: 1000, height: 1000 * plan.image.heightM / plan.image.widthM, ...(plan.image.crop ? { crop: { ...plan.image.crop } } : {}) };
}

export function apartmentGroupCodes(first: string, count: number): string[] {
  const match = first.trim().match(/^(.*?)(\d+)$/);
  if (!match || !Number.isInteger(count) || count < 1 || count > 100) throw new Error("Indica el código inicial y una cantidad entre 1 y 100 departamentos.");
  const start = Number(match[2]);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(start + count - 1)) throw new Error("Revisa la numeración inicial del grupo.");
  const codes = Array.from({ length: count }, (_, index) => `${match[1]}${String(start + index).padStart(match[2].length, "0")}`);
  if (codes.some(code => code.length > 80)) throw new Error("Los códigos de los departamentos deben tener como máximo 80 caracteres.");
  return codes;
}

export function duplicateFloor(source: PlanFloor, number: number): PlanFloor {
  return {
    ...source, id: crypto.randomUUID(), number, name: `Piso ${number}`,
    ...(source.image ? { image: { ...source.image, ...(source.image.crop ? { crop: { ...source.image.crop } } : {}) } } : {}),
    apartments: source.apartments.map((apartment, index) => ({
      ...apartment, id: crypto.randomUUID(), code: apartmentCode(number, index), status: "AVAILABLE",
      path: apartment.path.map(point => ({ ...point })),
    })),
  };
}

export function buildingMapPlan(plan: SitePlan): SitePlan {
  return {
    ...plan, lots: [],
    zones: [...plan.zones, ...(plan.buildings ?? []).map(building => ({
      id: building.id, name: building.name, path: building.path, kind: "BLOCK" as const,
    }))],
  };
}

export function floorPolygonValid(path: FloorPoint[]): boolean {
  if (path.length < 3 || path.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1)) return false;
  const cross = (a: FloorPoint, b: FloorPoint, c: FloorPoint) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  let area = 0;
  for (let i = 0; i < path.length; i++) {
    const a = path[i], b = path[(i + 1) % path.length];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-6) return false;
    area += a.x * b.y - b.x * a.y;
    for (let j = i + 2; j < path.length; j++) {
      if (i === 0 && j === path.length - 1) continue;
      const c = path[j], d = path[(j + 1) % path.length];
      if (cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0
        && Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)) <= Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x))
        && Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)) <= Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y))) return false;
    }
  }
  return Math.abs(area) > 1e-8;
}
