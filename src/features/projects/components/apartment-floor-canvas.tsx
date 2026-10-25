"use client";

import { useEffect, useRef, useState, type PointerEvent, type MouseEvent } from "react";
import { APARTMENT_STATUS_COLORS, apartmentBlockFrame, resizeApartmentBlock, snapApartmentPath, type FloorPoint, type PlanFloor } from "@/shared/lib/apartment-plan";
import s from "./apartment-plan.module.css";
import { polygonLabel, fitPolygonText } from "@/shared/lib/polygon-label";

export function ApartmentFloorCanvas({ floor, outline = [], selected, currency = "PEN", publicView = false, drawing = false, compact = false, showImage = true, points = [], previewPaths = [], previewLabels = [], onPoint, onDraw, onSelect, onPath, onBlockPaths }: {
  floor: PlanFloor;
  outline?: FloorPoint[];
  selected?: string;
  currency?: "PEN" | "USD";
  publicView?: boolean;
  drawing?: boolean;
  compact?: boolean;
  showImage?: boolean;
  previewPaths?: FloorPoint[][];
  previewLabels?: string[];
  points?: FloorPoint[];
  onPoint?: (point: FloorPoint) => void;
  onDraw?: (path: FloorPoint[]) => void;
  onSelect: (id: string) => void;
  onPath?: (path: FloorPoint[]) => void;
  onBlockPaths?: (paths: FloorPoint[][]) => void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [editBlock, setEditBlock] = useState(false);
  const [editPoints,setEditPoints]=useState(true);
  const [blockUndo,setBlockUndo]=useState<{floorId:string;ids:string[];paths:FloorPoint[][]}>();
  const blockDrag=useRef<{corner:number;start:FloorPoint;paths:FloorPoint[][]}|null>(null);
  const visiblePoints = publicView ? [...outline, ...floor.apartments.flatMap(apartment => apartment.path)] : [];
  const initialLeft = visiblePoints.length ? Math.min(...visiblePoints.map(p => p.x)) : 0;
  const initialRight = visiblePoints.length ? Math.max(...visiblePoints.map(p => p.x)) : 1;
  const initialTop = visiblePoints.length ? Math.min(...visiblePoints.map(p => p.y)) : 0;
  const initialBottom = visiblePoints.length ? Math.max(...visiblePoints.map(p => p.y)) : 1;
  const [zoom, setZoom] = useState(() => Math.max(1, Math.min(8, .8 / Math.max(initialRight-initialLeft, initialBottom-initialTop, .0001))));
  const [viewCenter, setViewCenter] = useState(() => ({ x:(initialLeft+initialRight)/2,y:(initialTop+initialBottom)/2 }));
  const [panMode, setPanMode] = useState(false);
  const pan = useRef<{ x:number;y:number;center:FloorPoint;inverse:DOMMatrix } | null>(null);
  const movingUnit = useRef<{ id: string; start: FloorPoint; path: FloorPoint[]; clientX: number; clientY: number; moved: boolean } | null>(null);
  const suppressSelect = useRef(false);
  const [hovered, setHovered] = useState<string>();
  const detail = publicView && !drawing && floor.apartments.find(a => a.id === hovered);



  const width = floor.image?.width ?? 1000, height = floor.image?.height ?? 700;
  const [renderScale, setRenderScale] = useState(1);
  useEffect(() => {
    const node = svg.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      const bounds = node.getBoundingClientRect();
      setRenderScale(Math.max(.001, Math.min(bounds.width / width, bounds.height / height) * zoom));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [width, height, zoom]);
  const half = .5 / zoom;
  const center = { x:Math.max(half,Math.min(1-half,viewCenter.x)), y:Math.max(half,Math.min(1-half,viewCenter.y)) };
  const locate = (event: PointerEvent<SVGElement> | MouseEvent<SVGElement>): FloorPoint => {
    const node = svg.current!;
    const matrix = node.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: Math.max(0, Math.min(1, point.x / width)), y: Math.max(0, Math.min(1, point.y / height)) };
  };
  const coordinates = (path: FloorPoint[]) => path.map(p => `${p.x * width},${p.y * height}`).join(" ");

  const unit = floor.apartments.find(a => a.id === selected);
  const blockEditing=editBlock&&!publicView&&!drawing&&Boolean(onBlockPaths)&&floor.apartments.length>0;
  const blockFrame=blockEditing?apartmentBlockFrame(floor.apartments.map(a=>a.path),height/width):undefined;
  const beginBlock=(event:PointerEvent<SVGElement>,corner:number)=>{
    if(event.button!==0)return;event.stopPropagation();
    const paths=floor.apartments.map(a=>a.path.map(p=>({...p})));
    setBlockUndo({floorId:floor.id,ids:floor.apartments.map(a=>a.id),paths});
    blockDrag.current={corner,start:locate(event),paths};event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveBlock=(event:PointerEvent<SVGElement>)=>{
    const drag=blockDrag.current;if(!drag)return;event.stopPropagation();const point=locate(event);
    if(drag.corner>=0){onBlockPaths?.(resizeApartmentBlock(drag.paths,drag.corner,point,height/width));return;}
    const points=drag.paths.flat();
    const dx=Math.max(-Math.min(...points.map(p=>p.x)),Math.min(1-Math.max(...points.map(p=>p.x)),point.x-drag.start.x));
    const dy=Math.max(-Math.min(...points.map(p=>p.y)),Math.min(1-Math.max(...points.map(p=>p.y)),point.y-drag.start.y));
    onBlockPaths?.(drag.paths.map(path=>path.map(p=>({x:p.x+dx,y:p.y+dy}))));
  };
  const endBlock=(event:PointerEvent<SVGElement>)=>{event.stopPropagation();blockDrag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);};
  return <div className={s.canvas}>
    <div className={s.zoomTools} role="group" aria-label="Zoom del plano del piso">
      <button type="button" aria-label="Acercar plano" disabled={zoom >= 8} onClick={() => setZoom(value=>Math.min(8,value*1.25))}>+</button>
      <button type="button" aria-label="Alejar plano" disabled={zoom <= 1} onClick={() => setZoom(value=>Math.max(1,value/1.25))}>−</button>
      <span>{Math.round(zoom*100)} %</span>
      <button type="button" onClick={() => {setZoom(1);setViewCenter({x:.5,y:.5});setPanMode(false);}}>Ver todo</button>
      <button type="button" aria-pressed={panMode} className={panMode?s.active:undefined} onClick={()=>setPanMode(value=>!value)}>{panMode?"Terminar de recorrer":"Mover vista"}</button>
      {!publicView&&onBlockPaths&&<button type="button" disabled={drawing||!floor.apartments.length} aria-pressed={blockEditing} className={blockEditing?s.active:undefined} onClick={()=>{setEditBlock(value=>!value);setPanMode(false);}}>{blockEditing?"Terminar ajuste del bloque":"Ajustar bloque completo"}</button>}
      {!publicView&&onPath&&<button type="button" disabled={drawing||!floor.apartments.length} aria-pressed={editPoints&&!blockEditing&&!panMode} onClick={()=>{
        const active=editPoints&&!blockEditing&&!panMode;
        setEditPoints(!active);setEditBlock(false);setPanMode(false);
        if(!active&&!unit&&floor.apartments[0])onSelect(floor.apartments[0].id);
      }}>{editPoints&&!blockEditing&&!panMode?"Terminar edición de puntos":"Editar puntos"}</button>}
      {blockEditing&&blockUndo?.floorId===floor.id&&blockUndo.ids.join()===floor.apartments.map(a=>a.id).join()&&<button type="button" onClick={()=>{onBlockPaths?.(blockUndo.paths);setBlockUndo(undefined);}}>Deshacer ajuste del bloque</button>}
      {unit && <button type="button" onClick={()=>{
        const left=Math.min(...unit.path.map(p=>p.x)),right=Math.max(...unit.path.map(p=>p.x)),top=Math.min(...unit.path.map(p=>p.y)),bottom=Math.max(...unit.path.map(p=>p.y));
        setViewCenter({x:(left+right)/2,y:(top+bottom)/2});setZoom(Math.max(1,Math.min(8,.7/Math.max(right-left,bottom-top))));setPanMode(false);
      }}>Enfocar departamento</button>}
    </div>
    <svg ref={svg} viewBox={`${(center.x-half)*width} ${(center.y-half)*height} ${width/zoom} ${height/zoom}`} preserveAspectRatio="xMidYMid meet" aria-label={`Plano de ${floor.name}`} style={{ cursor: panMode ? "grab" : drawing ? "crosshair" : "default", ...(compact ? { height: "auto", minHeight: 220, maxHeight: 440, aspectRatio: `${width} / ${height}` } : {}) }}
      onPointerDownCapture={event=>{
        if(!panMode||event.button!==0)return;
        const matrix=event.currentTarget.getScreenCTM();if(!matrix)return;
        event.stopPropagation();pan.current={x:event.clientX,y:event.clientY,center,inverse:matrix.inverse()};event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMoveCapture={event=>{
        const start=pan.current;if(!start)return;event.stopPropagation();
        const from=new DOMPoint(start.x,start.y).matrixTransform(start.inverse),to=new DOMPoint(event.clientX,event.clientY).matrixTransform(start.inverse);
        setViewCenter({x:Math.max(half,Math.min(1-half,start.center.x-(to.x-from.x)/width)),y:Math.max(half,Math.min(1-half,start.center.y-(to.y-from.y)/height))});
      }}
      onPointerUpCapture={event=>{if(!pan.current)return;event.stopPropagation();pan.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
      onPointerCancelCapture={()=>{pan.current=null;}} onLostPointerCapture={()=>{pan.current=null;}}
      onClickCapture={event=>{if(panMode)event.stopPropagation();}}
      onClick={event => {

        if (!drawing) return;
        const point = locate(event);
        if (points.length >= 3 && Math.hypot((point.x - points[0].x) * width, (point.y - points[0].y) * height) * renderScale < 12) { onDraw?.(points); return; }
        onPoint?.(point);
      }}>
      <rect width={width} height={height} fill="white" />
      {floor.image && <svg width={width} height={height} viewBox={floor.image.crop ? `${floor.image.crop.left * width} ${floor.image.crop.top * height} ${(floor.image.crop.right - floor.image.crop.left) * width} ${(floor.image.crop.bottom - floor.image.crop.top) * height}` : `0 0 ${width} ${height}`} preserveAspectRatio="none" opacity={showImage ? 1 : 0} pointerEvents="none"><image href={floor.image.url} width={width} height={height} preserveAspectRatio="none" /></svg>}
      {outline.length >= 3 && <polygon aria-label="Contorno del edificio" points={coordinates(outline)} fill="#2563eb" fillOpacity={.04} stroke="#123a68" strokeWidth={2} strokeDasharray="7 4" vectorEffect="non-scaling-stroke" pointerEvents="none" />}
      {floor.apartments.map(apartment => {
        const polygon = apartment.path.map(p => ({x:p.x*width,y:p.y*height}));
        const label = polygonLabel(polygon);
        const fitted = fitPolygonText(apartment.code, label.radius, 10 / renderScale, polygon, label);
        return <g key={apartment.id} role="button" tabIndex={drawing ? -1 : 0} aria-label={`Departamento ${apartment.code}`} style={{ cursor: drawing ? "crosshair" : !publicView && onPath ? "grab" : "pointer", touchAction: "none" }}
          onPointerDown={event => {
            if (drawing || publicView || !onPath || event.button !== 0) return;
            event.stopPropagation();
            onSelect(apartment.id);
            suppressSelect.current = false;
            movingUnit.current = { id: apartment.id, start: locate(event), path: apartment.path.map(p => ({ ...p })), clientX: event.clientX, clientY: event.clientY, moved: false };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={event => {
            const drag = movingUnit.current;
            if (!drag || drag.id !== apartment.id || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
            event.stopPropagation();
            if (!drag.moved && Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) < 4) return;
            drag.moved = true;
            const point = locate(event);
            const dx = Math.max(-Math.min(...drag.path.map(p => p.x)), Math.min(1 - Math.max(...drag.path.map(p => p.x)), point.x - drag.start.x));
            const dy = Math.max(-Math.min(...drag.path.map(p => p.y)), Math.min(1 - Math.max(...drag.path.map(p => p.y)), point.y - drag.start.y));
            const translated = drag.path.map(p => ({ x: p.x + dx, y: p.y + dy }));
            onPath?.(event.shiftKey ? translated : snapApartmentPath(translated, floor.apartments.filter(a => a.id !== apartment.id).map(a => a.path), 10 / (renderScale * width), height / width));
          }}
          onPointerUp={event => {
            if (movingUnit.current?.id !== apartment.id) return;
            event.stopPropagation();
            suppressSelect.current = movingUnit.current.moved;
            movingUnit.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { movingUnit.current = null; suppressSelect.current = false; }}
          onLostPointerCapture={() => { movingUnit.current = null; }}
          onPointerEnter={event => { if (publicView && event.pointerType === "mouse" && !drawing) setHovered(apartment.id); }} onPointerLeave={() => setHovered(undefined)}
          onClick={event => { if (!drawing) { event.stopPropagation(); if (suppressSelect.current) { suppressSelect.current = false; return; } setHovered(undefined); onSelect(apartment.id); } }}
          onKeyDown={event => {
            if (!drawing && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(apartment.id); }
            if(drawing||publicView||panMode||!onPath||selected!==apartment.id||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;
            event.preventDefault();event.stopPropagation();
            const step=(event.shiftKey?10:1)/renderScale;
            const dx=event.key==="ArrowLeft"?-step/width:event.key==="ArrowRight"?step/width:0,dy=event.key==="ArrowUp"?-step/height:event.key==="ArrowDown"?step/height:0;
            const path=apartment.path.map(p=>({x:p.x+dx,y:p.y+dy}));
            if(path.every(p=>p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1))onPath(path);
          }}>
          <polygon points={coordinates(apartment.path)} fill={APARTMENT_STATUS_COLORS[apartment.status]} fillOpacity={selected === apartment.id ? .45 : .22} stroke={selected === apartment.id ? "#1d4ed8" : APARTMENT_STATUS_COLORS[apartment.status]} strokeWidth={selected === apartment.id ? 2.5 : 1.5} vectorEffect="non-scaling-stroke" />
          <text x={label.x} y={label.y} transform={`rotate(${fitted.angle} ${label.x} ${label.y})`} textAnchor="middle" dominantBaseline="middle" fontSize={fitted.size} fontWeight={600} fill="#123a68" stroke="white" strokeWidth={1 / renderScale} paintOrder="stroke" pointerEvents="none">{apartment.code}</text>
        </g>;
      })}
      {points.length > 0 && <polyline points={coordinates(points.length >= 3 ? [...points, points[0]] : points)} fill="#2563eb22" stroke="#2563eb" strokeWidth={1.5} vectorEffect="non-scaling-stroke" pointerEvents="none" />}
      {points.map((point, index) => <g key={`vertex-${index}`} pointerEvents="none"><circle cx={point.x * width} cy={point.y * height} r={3 / renderScale} fill={index === 0 ? "#16a34a" : "#2563eb"} stroke="white" strokeWidth={1 / renderScale} /><text x={point.x * width + 7 / renderScale} y={point.y * height - 7 / renderScale} fontSize={10 / renderScale} fontWeight={600} fill="#123a68" stroke="white" strokeWidth={2 / renderScale} paintOrder="stroke">{index + 1}</text></g>)}
      {previewPaths.map((path, index) => {
        const center = path.reduce((sum, p) => ({ x: sum.x + p.x / path.length, y: sum.y + p.y / path.length }), { x: 0, y: 0 });
        return <g key={`group-${index}`} pointerEvents="none"><polygon points={coordinates(path)} fill="#2563eb" fillOpacity={.18} stroke="#2563eb" strokeWidth={1.5} vectorEffect="non-scaling-stroke" /><text x={center.x * width} y={center.y * height} fontSize={12 / renderScale} textAnchor="middle" dominantBaseline="middle" fontWeight={800} fill="#123a68">{previewLabels[index] ?? index + 1}</text></g>;
      })}
      {editPoints && !panMode && !blockEditing && !drawing && onPath && unit?.path.map((point, index) => <circle key={index} aria-label={`Mover punto ${index+1} del departamento ${unit.code}`} cx={point.x * width} cy={point.y * height} r={3 / renderScale} fill="white" stroke="#2563eb" strokeWidth={1} vectorEffect="non-scaling-stroke" style={{ cursor: "grab" }}
        onClick={event => event.stopPropagation()}
        onPointerDown={event => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={event => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          event.stopPropagation();
          onPath(unit.path.map((p, i) => i === index ? locate(event) : p));
        }}
        onPointerUp={event => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} />)}
      {blockFrame&&<g>
        <polygon aria-label="Mover bloque completo de departamentos" points={coordinates(blockFrame.corners)} fill="transparent" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" style={{cursor:"move"}} onClick={event=>event.stopPropagation()} onPointerDown={event=>beginBlock(event,-1)} onPointerMove={moveBlock} onPointerUp={endBlock} onPointerCancel={endBlock} onLostPointerCapture={()=>{blockDrag.current=null;}}/>
        {blockFrame.corners.map((point,index)=><circle key={index} aria-label={`Ajustar esquina ${index+1} del bloque`} cx={point.x*width} cy={point.y*height} r={3.5/renderScale} fill="white" stroke="#2563eb" strokeWidth={1} vectorEffect="non-scaling-stroke" style={{cursor:"nwse-resize"}} onClick={event=>event.stopPropagation()} onPointerDown={event=>beginBlock(event,index)} onPointerMove={moveBlock} onPointerUp={endBlock} onPointerCancel={endBlock} onLostPointerCapture={()=>{blockDrag.current=null;}}/>)}
      </g>}
    </svg>
    {detail && <div className={s.apartmentTooltip} role="status"><strong>Departamento {detail.code}</strong><span>{detail.areaM2} m²</span><strong>{new Intl.NumberFormat("es-PE",{style:"currency",currency}).format(detail.price)}{detail.operation === "RENT" ? "/mes" : ""}</strong></div>}
  </div>;
}
