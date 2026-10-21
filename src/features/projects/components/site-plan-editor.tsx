"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  FileSpreadsheet,
  Pencil,
  Save,
  Upload,
  Undo2,
} from "lucide-react";
import { env } from "@/shared/lib/env";
import {
  uploadImageToCloudinary,
  PROJECT_MEDIA_FOLDER,
  uploadToCloudinary,
} from "@/shared/lib/api/cloudinary";
import { SitePlanMap, type PlanTool } from "@/shared/ui/site-plan-map";
import { SitePlanCanvas } from "@/shared/ui/site-plan-canvas";
import { AdminLotDetail } from "./admin-lot-detail";
import { PdfPlanImport } from "./pdf-plan-import";
import { LotTable } from "./lot-table";
import { geoToImage, imageToGeo, placeImageAnchor } from "@/shared/lib/plan-coordinates";
import { rectangularSides, rectangularMetrics } from "@/shared/lib/lot-measurements";
import { monthlyInstallment } from "@/shared/lib/lot-financing";
import { alignLotToBoundary } from "@/shared/lib/align-lot-boundary";
import {
  LOT_LABELS,
  newLot,
  polygonMetrics,
  measuredLotGroup,
  type PlanLot,
  type PlanSession,
  type PlanZone,
  type Point,
  type SitePlan,
} from "../types/site-plan";
import s from "./site-plan.module.css";

const toolLabels: Partial<Record<PlanTool, string>> = {
  SELECT: "Seleccionar / mover",
  BLOCK: "Manzana",
  CONTOUR: "Contorno",
  LOT: "Lote",
};
const fileUrl = (path: string) => `${env.apiUrl}${path}`;
const lotKey = (lot: PlanLot) =>
  `${lot.block.trim().toLowerCase()}|${lot.code.trim().toLowerCase()}`;

export function SitePlanEditor({ initial }: { initial: PlanSession }) {
  const [plan, setPlan] = useState(initial.plan);
  const [pdfFile, setPdfFile] = useState<File>();
  const [showLotTable, setShowLotTable] = useState(false);
  const [moveAll, setMoveAll] = useState(false);
  const [blockFixed, setBlockFixed] = useState(false);
  const [focusPlanRequest, setFocusPlanRequest] = useState(0);
  const [revision, setRevision] = useState(initial.revision);
  const [publishedAt, setPublishedAt] = useState(initial.publishedAt);
  const [dirty, setDirty] = useState(false);
  const [tool, setTool] = useState<PlanTool>("SELECT");
  const [points, setPoints] = useState<Point[]>([]);
  const [selected, setSelected] = useState<string>();
  const [editingLot, setEditingLot] = useState(false);
  const [lot, setLot] = useState<PlanLot>();
  const [zone, setZone] = useState<PlanZone>();
  const [blockName, setBlockName] = useState("");
  const sidebar = useRef<HTMLElement>(null);
  const [showImage, setShowImage] = useState(true);
  const [panel, setPanel] = useState<"BASE" | "IMAGE" | "SUMMARY" | "ZONES">(
    "BASE",
  );
  const [view, setView] = useState<"PLAN" | "MAP">("PLAN");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [groupCount, setGroupCount] = useState(10);
  const [groupFront, setGroupFront] = useState(8);
  const [groupDepth, setGroupDepth] = useState(18);
  const [groupDirection, setGroupDirection] = useState(false);
  const groupPreview = useMemo(() => {
    if (tool !== "GROUP" || points.length !== 4) return [];
    try { return measuredLotGroup(points, groupCount, groupFront, groupDepth, groupDirection).map(l => l.path); }
    catch { return []; }
  }, [tool, points, groupCount, groupFront, groupDepth, groupDirection]);
  const groupProportionMismatch = (() => {
    if (tool !== "GROUP" || points.length !== 4 || !plan.image || !groupPreview.length) return false;
    const image = plan.image;
    const ordered = groupDirection ? [points[1], points[2], points[3], points[0]] : points;
    const xy = ordered.map(p => geoToImage(p, image));
    const distance = (a: typeof xy[number], b: typeof xy[number]) => Math.hypot((b.x - a.x) * image.widthM, (b.y - a.y) * image.heightM);
    const width = (distance(xy[0], xy[1]) + distance(xy[3], xy[2])) / 2;
    const depth = (distance(xy[0], xy[3]) + distance(xy[1], xy[2])) / 2;
    return depth > 0 && Math.abs(width / depth / (groupCount * groupFront / groupDepth) - 1) > 0.25;
  })();
  const [groupStart, setGroupStart] = useState(1);
  const [groupBlock, setGroupBlock] = useState("");
  const [groupStreet, setGroupStreet] = useState("");
  const [groupTerms, setGroupTerms] = useState({
    areaM2: 0,
    price: 0,
    dimensions: "",
    cashAllowed: true,
    financingAllowed: false,
    financedPrice: 0,
    downPayment: 0,
    installments: 36,
  });
  const [imported, setImported] = useState<PlanLot[]>();
  const [centerRequest, setCenterRequest] = useState(0);
  const [history, setHistory] = useState<SitePlan[]>([]);
  const mapCenter = useRef<Point>({
    lat: Number(initial.project.location?.latitude ?? -12.0464),
    lng: Number(initial.project.location?.longitude ?? -77.0428),
  });
  const center = useMemo<Point>(() => ({
    lat: Number(initial.project.location?.latitude ?? -12.0464),
    lng: Number(initial.project.location?.longitude ?? -77.0428),
  }), [initial.project.location?.latitude, initial.project.location?.longitude]);
  const hasLocation =
    initial.project.location?.latitude != null &&
    initial.project.location?.longitude != null;
  const projectMarkers = useMemo(
    () =>
      hasLocation
        ? [
            {
              id: "project-location",
              ...center,
              title: initial.project.name,
              priceLabel: [
                [initial.project.location?.street, initial.project.location?.streetNumber].filter(Boolean).join(" "),
                initial.project.location?.district,
                initial.project.location?.province,
              ].filter(Boolean).join(", ") || "Ubicación registrada del proyecto",
            },
          ]
        : [],
    [hasLocation, center, initial.project.name, initial.project.location],
  );
  const basePath = `/admin/projects/${initial.project.id}/site-plan`;
  const activePanel = lot
    ? "LOT"
    : zone
      ? "ZONE"
      : tool === "GROUP"
        ? "GROUP"
        : tool === "LOT"
          ? "LOT"
          : tool === "BLOCK" || tool === "CONTOUR"
            ? "ZONE"
            : panel;
  const formPending = Boolean(lot || zone || points.length || blockName.trim());
  const movingWholeBlock = !formPending && !busy && (moveAll || (view === "MAP" && !showImage && !blockFixed));
  const unsaved = dirty || formPending;
  const previewZone =
    zone ??
    (tool === "BLOCK" && points.length >= 3
      ? {
          id: "drawing-block",
          kind: "BLOCK" as const,
          name: blockName,
          path: points,
        }
      : undefined);
  const previewZonesPlan = previewZone
    ? {
        ...plan,
        zones: [
          ...plan.zones.filter((z) => z.id !== previewZone.id),
          previewZone,
        ],
      }
    : plan;
  const previewPlan = lot && lot.path.length >= 3
    ? { ...previewZonesPlan, lots: [...previewZonesPlan.lots.filter(l => l.id !== lot.id), lot] }
    : previewZonesPlan;
  useEffect(() => {
    sidebar.current?.scrollTo({ top: 0 });
  }, [activePanel, zone?.id, lot?.id]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (unsaved) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  function change(next: SitePlan) {
    if (
      next.image &&
      (!(next.image.widthM >= 1) ||
        !(next.image.heightM >= 1) ||
        !Number.isFinite(next.image.rotation) ||
        !Number.isFinite(next.image.center.lat) ||
        Math.abs(next.image.center.lat) > 85 ||
        !Number.isFinite(next.image.center.lng) ||
        Math.abs(next.image.center.lng) > 180)
    ) {
      setError("Revisa las dimensiones y coordenadas del plano.");
      return;
    }
    if (
      plan.image &&
      next.image &&
      plan.image !== next.image &&
      plan.image.url === next.image.url
    ) {
      if (formPending) {
        setError(
          "Guarda o cierra la forma antes de ajustar la ubicación del plano.",
        );
        return;
      }
      const previousImage = plan.image,
        nextImage = next.image;
      const transform = (p: Point) =>
        imageToGeo(geoToImage(p, previousImage), nextImage);
      next = {
        ...next,
        lots: next.lots.map((l) => ({ ...l, path: l.path.map(transform) })),
        zones: next.zones.map((z) => ({ ...z, path: z.path.map(transform) })),
      };
    }
    setHistory((previous) => [...previous.slice(-29), plan]);
    setPlan(next);
    setDirty(true);
    setMessage("");
  }
  function closeForm() {
    setMoveAll(false);
    setLot(undefined);
    setZone(undefined);
    setSelected(undefined);
    setPoints([]);
    setTool("SELECT");
    setPanel("BASE");
    setBlockName("");
  }
  function confirmDiscard() {
    return (
      !formPending ||
      window.confirm(
        "Hay una forma abierta. ¿Descartar los cambios de esa forma?",
      )
    );
  }
  function clearDrawing() {
    const nextTool = zone?.kind === "BLOCK" ? "BLOCK" : lot ? "LOT" : tool;
    closeForm();
    setTool(nextTool);
    setError("");
  }
  function select(id: string) {
    if (busy) return;
    if (id === selected) return;
    if (!confirmDiscard()) return;
    closeForm();
    setTool("SELECT");
    setSelected(id);
    setEditingLot(false);
    setError("");
    const found = plan.lots.find((l) => l.id === id);
    if (found) setLot(structuredClone(found));
    else {
      const foundZone = plan.zones.find((z) => z.id === id);
      if (foundZone) {
        setZone(structuredClone(foundZone));
        if (foundZone.kind === "BLOCK") setGroupBlock(foundZone.name);
      }
    }
  }
  function chooseTool(next: PlanTool) {
    if (next !== "SELECT" && !plan.image) {
      setError("Primero sube el plano del proyecto para dibujar sobre él.");
      return;
    }
    if (!confirmDiscard()) return;
    closeForm();
    setTool(next);
    if (next !== "SELECT") {
      setView("PLAN");
      setShowImage(true);
    }
    setError("");
  }
  function finish() {
    completeDrawing(points);
  }
  function completeDrawing(points: Point[]) {
    if (!plan.image) {
      setError("Sube el plano antes de dibujar.");
      return;
    }
    if (points.length < 3) return;
    if (polygonMetrics(points).areaM2 <= 0) {
      setError("El polígono no tiene área. Revisa los vértices.");
      return;
    }
    setError("");
    if (tool === "BLOCK" || tool === "STREET" || tool === "CONTOUR")
      setZone({
        id: crypto.randomUUID(),
        kind: tool,
        name: tool === "CONTOUR" ? "Contorno" : blockName,
        path: points,
      });
    else if (tool === "LOT") setLot({ ...newLot(points), block: groupBlock });
    else if (tool === "GROUP") {
      try {
        const measured = measuredLotGroup(points, groupCount, groupFront, groupDepth, groupDirection);
        const parts = measured.map(l => l.path);
        if (!groupBlock.trim())
          throw new Error("Escribe la manzana del grupo.");
        if (!Number.isInteger(groupStart) || groupStart < 1)
          throw new Error("La numeración inicial debe ser un entero positivo.");
        const availableBase = plan.lots.filter(
          (l) =>
            l.block.trim().toLowerCase() === groupBlock.trim().toLowerCase() &&
            l.fromExcel &&
            !l.path.length,
        );
        if (availableBase.length && availableBase.length < groupCount)
          throw new Error(
            `La manzana tiene ${availableBase.length} lotes sin dibujar. Ajusta la cantidad o asígnalos uno por uno.`,
          );
        const generated = parts.map((path, i) => {
          if (availableBase.length) return { ...availableBase[i], path };
          const created = newLot(path);
          const areaM2 = measured[i].areaM2;
          return {
            ...created,
            ...groupTerms,
            ...measured[i],
            areaM2,
            priceM2: Math.round((groupTerms.price / areaM2) * 100) / 100,
            monthlyPayment:
              groupTerms.installments > 0
                ? Math.round(
                    ((groupTerms.financedPrice - groupTerms.downPayment) /
                      groupTerms.installments) *
                      100,
                  ) / 100
                : 0,
            code: `L-${String(groupStart + i).padStart(2, "0")}`,
            block: groupBlock.trim(),
            street: groupStreet,
          };
        });
        const keys = new Set(
          plan.lots
            .filter((l) => !generated.some((g) => g.id === l.id))
            .map(lotKey),
        );
        for (const item of generated) {
          if (keys.has(lotKey(item)))
            throw new Error(
              `Ya existe ${item.code} en la manzana ${item.block}.`,
            );
          keys.add(lotKey(item));
        }
        const nextPlan: SitePlan = {
          ...plan,
          lots: [
            ...plan.lots.filter((l) => !generated.some((g) => g.id === l.id)),
            ...generated,
          ],
        };
        change(nextPlan);
        setPoints([]);
        setTool("SELECT");
        setMessage(
          `${generated.length} lotes individuales creados. Selecciona cada uno para revisar sus condiciones.`,
        );
        void save(false, nextPlan);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo dividir el grupo",
        );
      }
    }
  }

  async function saveLot(event: React.FormEvent) {
    event.preventDefault();
    if (!lot) return;
    if (!lot.code.trim() || !(lot.areaM2 > 0)) {
      setError("Completa el código y un área mayor que cero.");
      return;
    }
    if (plan.lots.some((l) => l.id !== lot.id && lotKey(l) === lotKey(lot))) {
      setError("Ese código ya existe en la manzana.");
      return;
    }
    if (!lot.cashAllowed && !lot.financingAllowed) {
      setError("Habilita al contado o financiamiento.");
      return;
    }
    if (
      lot.financingAllowed &&
      (!lot.installments || lot.downPayment > lot.financedPrice)
    ) {
      setError("Revisa el número de cuotas y la inicial del financiamiento.");
      return;
    }
    const nextPlan: SitePlan = {
      ...plan,
      lots: plan.lots.some((l) => l.id === lot.id)
        ? plan.lots.map((l) => (l.id === lot.id ? lot : l))
        : [...plan.lots, lot],
    };
    change(nextPlan);
    closeForm();
    setTool("SELECT");
    setError("");
    await save(false, nextPlan);
  }
  async function saveZone(event: React.FormEvent) {
    event.preventDefault();
    if (tool === "CONTOUR" || zone?.kind === "CONTOUR") {
      const path = zone?.path ?? points;
      if (path.length < 3 || polygonMetrics(path).areaM2 <= 0) {
        setError("Dibuja al menos tres vértices para guardar el contorno.");
        return;
      }
      const contour: PlanZone = {
        id: zone?.id ?? crypto.randomUUID(),
        kind: "CONTOUR",
        name: zone?.name || `Contorno ${crypto.randomUUID().slice(0, 8)}`,
        path,
      };
      const nextPlan: SitePlan = {
        ...plan,
        zones: [...plan.zones.filter(z => z.id !== contour.id), contour],
      };
      change(nextPlan);
      closeForm();
      setPanel("ZONES");
      setError("");
      await save(false, nextPlan);
      return;
    }
    const current =
      zone ??
      (tool === "BLOCK"
        ? {
            id: crypto.randomUUID(),
            kind: "BLOCK" as const,
            name: blockName,
            path: points,
          }
        : undefined);
    if (!current?.name.trim()) {
      setError("Escribe el nombre de la manzana.");
      return;
    }
    if (current.path.length < 3 || polygonMetrics(current.path).areaM2 <= 0) {
      setError("Dibuja al menos tres vértices para guardar la manzana.");
      return;
    }
    const previous = plan.zones.find((z) => z.id === current.id);
    if (
      plan.zones.some(
        (z) =>
          z.id !== current.id &&
          z.kind === current.kind &&
          z.name.trim().toLowerCase() === current.name.trim().toLowerCase(),
      )
    ) {
      setError("Ya existe una zona con ese nombre.");
      return;
    }
    const field = current.kind === "BLOCK" ? "block" : "street";
    const savedZone = { ...current, name: current.name.trim() };
    change({
      ...plan,
      zones: previous
        ? plan.zones.map((z) => (z.id === current.id ? savedZone : z))
        : [...plan.zones, savedZone],
      lots: previous && current.kind !== "CONTOUR"
        ? plan.lots.map((l) =>
            l[field] === previous.name ? { ...l, [field]: savedZone.name } : l,
          )
        : plan.lots,
    });
    closeForm();
    setTool("SELECT");
    setPanel("ZONES");
    if (savedZone.kind === "BLOCK") setGroupBlock(savedZone.name);
    setError("");
  }
  function updatePath(id: string, path: Point[]) {
    if (busy) return;
    const current =
      plan.lots.find((l) => l.id === id) ?? plan.zones.find((z) => z.id === id);
    if (!current || JSON.stringify(current.path) === JSON.stringify(path))
      return;
    if (movingWholeBlock && current.path[0] && path[0]) {
      const delta = { lat: path[0].lat - current.path[0].lat, lng: path[0].lng - current.path[0].lng };
      const move = (p: Point) => ({ lat: p.lat + delta.lat, lng: p.lng + delta.lng });
      change({
        ...plan,
        image: plan.image ? { ...plan.image, center: move(plan.image.center) } : undefined,
        lots: plan.image ? plan.lots : plan.lots.map(l => ({ ...l, path: l.path.map(move) })),
        zones: plan.image ? plan.zones : plan.zones.map(z => ({ ...z, path: z.path.map(move) })),
      });
      return;
    }
    change({
      ...plan,
      lots: plan.lots.map((l) => (l.id === id ? { ...l, path } : l)),
      zones: plan.zones.map((z) => (z.id === id ? { ...z, path } : z)),
    });
    if (lot?.id === id) setLot({ ...lot, path });
    if (zone?.id === id) setZone({ ...zone, path });
  }
  function rotateAll(degrees: number) {
    if (!plan.image || formPending || !Number.isFinite(degrees)) return;
    setView("MAP");
    change({ ...plan, image: { ...plan.image, rotation: Math.max(-360, Math.min(360, degrees)) } });
  }
  function drawingAnchor(): Point {
    const contours = plan.zones.filter(z => z.kind === "CONTOUR").flatMap(z => z.path);
    const lots = plan.lots.flatMap(l => l.path);
    const outline = contours.length ? contours : lots.length ? lots : plan.zones.flatMap(z => z.path);
    const bounds = outline.reduce((b, p) => ({ south: Math.min(b.south, p.lat), north: Math.max(b.north, p.lat), west: Math.min(b.west, p.lng), east: Math.max(b.east, p.lng) }), { south: Infinity, north: -Infinity, west: Infinity, east: -Infinity });
    const anchor = outline.length ? {
      lat: (bounds.south + bounds.north) / 2,
      lng: (bounds.west + bounds.east) / 2,
    } : plan.image?.center ?? center;
    return anchor;
  }
  function resizeWholePlan(factor: number) {
    if (!plan.image || formPending) return;
    const image = plan.image;
    const widthM = image.widthM * factor, heightM = image.heightM * factor;
    if (widthM < 1 || heightM < 1 || widthM > 100000 || heightM > 100000) return;
    const anchor = drawingAnchor();
    const scaled = { ...image, widthM, heightM };
    const shiftedAnchor = imageToGeo(geoToImage(anchor, image), scaled);
    change({ ...plan, image: placeImageAnchor(scaled, shiftedAnchor, anchor) });
    setView("MAP");
  }
  function relocatePlan(target: Point) {
    if (!plan.image || formPending) return;
    const anchor = drawingAnchor();
    change({ ...plan, image: placeImageAnchor(plan.image, anchor, target) });
  }
  async function save(publish: boolean, snapshot?: SitePlan, fixPosition = false) {
    if (formPending && !snapshot) {
      setError(
        "Guarda o cierra el formulario y termina el dibujo antes de guardar el plano.",
      );
      return;
    }
    if (publish && !hasLocation) {
      setError(
        "Define primero el punto exacto del proyecto en Editar proyecto.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(fileUrl(basePath), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision, plan: snapshot ?? plan, publish }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(" ")
            : data.message || "No se pudo guardar",
        );
      setRevision(data.revision);
      if (publish) setPublishedAt(data.publishedAt);
      setDirty(false);
      if (fixPosition) {
        setBlockFixed(true);
        setMoveAll(false);
      }
      setMessage(
        publish
          ? "Plano publicado. Ya está disponible en la ficha pública del proyecto si el proyecto está publicado."
          : "Borrador guardado. La versión pública conserva la última publicación.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File | undefined, logo = false, pdfSource?: { file: File; page: number }): Promise<boolean> {
    if (!file) return false;
    if (formPending) {
      setError(
        "Guarda o cierra la forma abierta antes de subir el plano o el logo.",
      );
      return false;
    }
    if (!logo && !pdfSource && (file.type === "application/pdf" || /\.pdf$/i.test(file.name))) {
      if (file.size > 30 * 1024 * 1024) { setError("El PDF debe pesar como máximo 30 MB."); return false; }
      setPdfFile(file); setError(""); return false;
    }
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError(logo ? "Usa una imagen PNG, JPG o WebP de hasta 10 MB." : "Usa un PDF de hasta 30 MB o una imagen PNG, JPG o WebP de hasta 10 MB.");
      return false;
    }
    setBusy(true);
    setError("");
    try {
      const original = pdfSource ? await uploadToCloudinary(pdfSource.file, PROJECT_MEDIA_FOLDER, "raw") : undefined;
      const result = await uploadImageToCloudinary(file, PROJECT_MEDIA_FOLDER);
      let nextPlan: SitePlan;
      if (logo) nextPlan = { ...plan, logoUrl: result.url };
      else {
        const bitmap = await createImageBitmap(file);
        const ratio = bitmap.height / bitmap.width;
        bitmap.close();
        nextPlan = {
          ...plan,
          lots: plan.image ? [] : plan.lots,
          zones: [],
          image: {
            url: result.url,
            center,
            widthM: 250,
            heightM: 250 * ratio,
            rotation: 0,
            opacity: plan.image?.opacity ?? 0.85,
            ...(original && pdfSource ? { sourcePdfUrl: original.url, sourcePdfPage: pdfSource.page, sourcePdfName: pdfSource.file.name.slice(0,255) } : {}),
          },
        };
        closeForm();
        setEditingLot(false);
        setImported(undefined);
        setGroupBlock("");
        setGroupStreet("");
        setShowImage(true);
      }
      change(nextPlan);
      const response = await fetch(fileUrl(basePath), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision, plan: nextPlan, publish: false }),
      });
      const saved = await response.json();
      if (!response.ok)
        throw new Error(
          (Array.isArray(saved.message)
            ? saved.message.join(" ")
            : saved.message || "No se pudo guardar el plano") +
            ". La imagen está cargada pero aún no guardada: no refresques y vuelve a guardar el borrador.",
        );
      setRevision(saved.revision);
      setDirty(false);
      setHistory([]);
      setMessage(
        logo
          ? "Logo guardado en el proyecto."
          : plan.image
            ? "Plano reemplazado y guardado. Se limpiaron los lotes y las manzanas anteriores."
            : "Plano guardado en el proyecto. Puedes refrescar sin perder la imagen.",
      );
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo subir la imagen",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch(fileUrl(`${basePath}/import`), {
        method: "POST",
        credentials: "include",
        body,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          Array.isArray(data.message) ? data.message.join(" · ") : data.message,
        );
      const status: Record<string, PlanLot["status"]> = {
        disponible: "AVAILABLE",
        reservado: "RESERVED",
        vendido: "SOLD",
        bloqueado: "BLOCKED",
        available: "AVAILABLE",
        reserved: "RESERVED",
        sold: "SOLD",
        blocked: "BLOCKED",
      };
      const yes = (value: string) =>
        ["si", "sí", "true", "1"].includes(value.toLowerCase());
      const seen = new Set<string>();
      const rows = (data.rows as Record<string, string>[]).map((row) => {
        const next: PlanLot = {
          ...newLot(),
          fromExcel: true,
          code: row.codigo,
          block: row.manzana || "",
          street: row.calle || "",
          address: row.direccion || "",
          type: row.tipo || "",
          dimensions: row.dimensiones || "",
          areaM2: Number(row.area_m2),
          perimeterM: Number(row.perimetro_m),
          frontM: Number(row.frente_m),
          price: Number(row.precio_contado),
          priceM2:
            Number(row.precio_m2) ||
            Number(row.precio_contado) / Number(row.area_m2),
          status: status[row.estado?.toLowerCase()] ?? "AVAILABLE",
          cashAllowed: row.contado ? yes(row.contado) : true,
          financingAllowed: yes(row.financiado || ""),
          financedPrice: Number(row.precio_financiado),
          downPayment: Number(row.inicial),
          installments: Number(row.cuotas),
          monthlyPayment: Number(row.cuota_mensual),
          notes: row.notas || "",
        };
        if (seen.has(lotKey(next)))
          throw new Error(`El Excel repite ${next.code} en ${next.block}.`);
        if (!next.cashAllowed && !next.financingAllowed)
          throw new Error(
            `${next.code}: habilita al contado o financiamiento.`,
          );
        if (
          next.financingAllowed &&
          (!Number.isInteger(next.installments) ||
            next.installments < 1 ||
            next.downPayment > next.financedPrice)
        )
          throw new Error(`${next.code}: revisa inicial y cuotas.`);
        seen.add(lotKey(next));
        return next;
      });
      setImported(rows);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo leer el Excel",
      );
    } finally {
      setBusy(false);
    }
  }
  function applyImport() {
    if (!imported) return;
    const next = [...plan.lots];
    for (const item of imported) {
      const index = next.findIndex((l) => lotKey(l) === lotKey(item));
      if (index >= 0)
        next[index] = { ...item, id: next[index].id, path: next[index].path };
      else next.push(item);
    }
    change({ ...plan, lots: next });
    setImported(undefined);
    setMessage(
      "Base importada. Los lotes coincidentes conservan su dibujo; los nuevos están listos para asignar.",
    );
  }
  function removeSelected() {
    if (!window.confirm("¿Eliminar este elemento del borrador?")) return;
    change({
      ...plan,
      lots: plan.lots.filter((l) => l.id !== selected),
      zones: plan.zones.filter((z) => z.id !== selected),
    });
    closeForm();
  }
  const money = (value: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: initial.project.currency,
    }).format(value);
  function updateLotValues(values: Partial<PlanLot>) {
    setLot(current => {
      if (!current) return current;
      const next = { ...current, ...values };
      if (values.price !== undefined || values.areaM2 !== undefined) {
        next.priceM2 = next.areaM2 > 0
          ? Math.round(next.price / next.areaM2 * 100) / 100
          : 0;
      }
      if (next.financingAllowed && ['financedPrice', 'downPayment', 'installments', 'interestRateMonthly', 'financingAllowed'].some(field => field in values)) {
        next.monthlyPayment = monthlyInstallment(next.financedPrice, next.downPayment, next.installments, next.interestRateMonthly ?? 0);
      }
      return next;
    });
  }
  const numeric = (
    label: string,
    field: keyof PlanLot,
    min = 0,
    step = "0.01",
  ) => (
    <label key={field}>
      {label}
      <input
        type="number"
        min={min}
        step={step}
        required
        value={String(lot?.[field] ?? 0)}
        onChange={(e) =>
          updateLotValues({ [field]: Number(e.target.value) })
        }
      />
    </label>
  );
  function updateSide(side: "front" | "depth", value: number) {
    if (!lot) return;
    const sides = rectangularSides(lot.dimensions);
    const front = side === "front" ? value : (sides?.front ?? lot.frontM);
    const depth = side === "depth" ? value : (sides?.depth ?? 0);
    updateLotValues({
      frontM: front,
      dimensions: `${front} × ${depth} m`,
      ...rectangularMetrics(front, depth),
    });
  }
  const text = (label: string, field: keyof PlanLot, required = false) => (
    <label key={field}>
      {label}
      <input
        required={required}
        maxLength={field === "address" ? 300 : field === "code" ? 80 : 100}
        value={String(lot?.[field] ?? "")}
        onChange={(e) =>
          setLot(lot ? { ...lot, [field]: e.target.value } : undefined)
        }
      />
    </label>
  );

  if (showLotTable) {
    return <fieldset disabled={busy} aria-busy={busy} className={`${s.editor} ${s.bookView}`}>
      <LotTable plan={plan} project={initial.project} exportUrl={fileUrl(`${basePath}/export`)} onClose={() => setShowLotTable(false)} onEdit={id => { select(id); setEditingLot(true); }} onDelete={id => change({ ...plan, lots: plan.lots.filter(l => l.id !== id) })} />
    </fieldset>;
  }

  return (
    <fieldset disabled={busy} aria-busy={busy} className={s.editor}>

      {pdfFile && <PdfPlanImport file={pdfFile} onImport={(image, source) => upload(image, false, source)} onClose={() => setPdfFile(undefined)} />}
      <div className={s.toolbar}>
        <div>
          <Link href="/panel/admin/projects/all" className={s.muted}>
            ← Todos los proyectos
          </Link>
          <h1>{initial.project.name}</h1>
          <p className={s.muted}>
            Editor del plano ·{" "}
            <span className={s.badge}>
              {dirty ? "Cambios sin guardar" : "Borrador guardado"}
            </span>
            {publishedAt &&
              ` · Publicado ${new Date(publishedAt).toLocaleDateString("es-PE")}`}
          </p>
        </div>
        <div className={s.actions}>
          <Link
            href={`/panel/admin/projects/${initial.project.id}/edit`}
            className={s.button}
          >
            Editar proyecto
          </Link>
          <button disabled={busy} onClick={() => save(false)}>
            <Save size={15} />
            Guardar borrador
          </button>
          <button
            disabled={busy}
            className={s.primary}
            onClick={() => save(true)}
          >
            {busy ? "Procesando…" : "Publicar plano"}
          </button>
        </div>
      </div>
      {error && (
        <div role="alert" className={s.error}>
          {error}
        </div>
      )}
      {message && (
        <div role="status" className={s.notice}>
          {message}
        </div>
      )}
      {!hasLocation && (
        <div className={s.error}>
          El proyecto aún no tiene coordenadas. Define su punto exacto en
          «Editar proyecto» antes de publicar el plano.
        </div>
      )}
      <div className={s.toolbar}>
        <div className={s.actions}>
          {Object.entries(toolLabels).map(([value, label]) => (
            <button
              key={value}
              disabled={busy}
              className={tool === value ? s.active : ""}
              onClick={() => chooseTool(value as PlanTool)}
            >
              {value === "SELECT" ? <Pencil size={14} /> : null}
              {label}
            </button>
          ))}
          <button
            disabled={busy || points.length === 0}
            onClick={() => setPoints(points.slice(0, -1))}
          >
            Quitar punto
          </button>
          <button
            disabled={busy || points.length < 3 || Boolean(lot || zone)}
            onClick={finish}
          >
            Terminar dibujo ({points.length})
          </button>
          <button
            type="button"
            disabled={busy || (!points.length && !lot && !zone)}
            onClick={clearDrawing}
            title="Limpiar únicamente el dibujo o formulario en curso"
          >
            Limpiar dibujo
          </button>
          <button
            disabled={
              busy ||
              (!history.length &&
                !points.length &&
                !(!selected && (lot || zone)))
            }
            onClick={() => {
              if (points.length > 0 || (!selected && (lot || zone))) {
                clearDrawing();
                return;
              }
              const previous = history[history.length - 1];
              if (previous) {
                setHistory(history.slice(0, -1));
                setPlan(previous);
                closeForm();
                setDirty(true);
              }
            }}
          >
            <Undo2 size={15} />
            Deshacer
          </button>
        </div>
        <div className={s.actions}>
          <button onClick={() => { setShowImage(!showImage); setMoveAll(false); setBlockFixed(false); }}>
            {showImage ? <EyeOff size={15} /> : <Eye size={15} />}
            {showImage ? "Ocultar imagen" : "Mostrar imagen"}
          </button>
          <label className={s.button}>
            <Upload size={15} />
            {plan.image ? "Reemplazar plano" : "Subir plano"}
            <input
              hidden
              type="file"
              accept="application/pdf,.pdf,image/png,image/jpeg,image/webp"
              disabled={busy}
              onChange={(event) => {
                void upload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <button
            className={view === "PLAN" ? s.active : ""}
            onClick={() => setView("PLAN")}
          >
            Dibujar sobre plano
          </button>
          <button
            className={view === "MAP" ? s.active : ""}
            onClick={() => {
              if (formPending) {
                setError(
                  "Guarda o cierra la forma antes de cambiar a Google Maps.",
                );
                return;
              }
              setTool("SELECT");
              setView("MAP");
            }}
          >
            Alinear en Google Maps
          </button>
          {!showImage && <button type="button" className={movingWholeBlock ? s.active : ""} disabled={busy} onClick={() => {
            if (!confirmDiscard()) return;
            const next = !movingWholeBlock;
            closeForm();
            setTool("SELECT");
            setView("MAP");
            setMoveAll(next);
            setBlockFixed(!next);
          }}>{movingWholeBlock ? "Terminar de mover" : "Mover todo"}</button>}
          {plan.image && <>
            <button type="button" disabled={busy} onClick={() => { setView("MAP"); setFocusPlanRequest(n => n + 1); }}>Enfocar lotes</button>
            <div className={s.groupRotation}>
              <span>Escala del plano</span>
              <button type="button" disabled={busy || formPending} onClick={() => resizeWholePlan(0.95)}>−5 %</button>
              <button type="button" disabled={busy || formPending} onClick={() => resizeWholePlan(1.05)}>+5 %</button>
            </div>
            <button type="button" disabled={busy || formPending || !hasLocation} onClick={() => {
              closeForm();
              relocatePlan(center);
              setView("MAP");
              setCenterRequest(n => n + 1);
            }}>Traer plano al punto del proyecto</button>
            {view === "MAP" && <button type="button" disabled={busy || formPending || !dirty} onClick={() => save(false, undefined, true)}>Fijar ubicación</button>}
          </>}
          {!showImage && plan.image && <div className={s.groupRotation}>
            <span>Girar conjunto</span>
            <button type="button" aria-label="Girar todo un grado a la izquierda" disabled={busy || formPending} onClick={() => rotateAll(plan.image!.rotation - 1)}>↶</button>
            <input type="range" aria-label="Rotación de todo el conjunto" min={-360} max={360} step={0.1} value={plan.image.rotation} disabled={busy || formPending} onChange={e => rotateAll(Number(e.target.value))} />
            <input type="number" aria-label="Ángulo del conjunto en grados" min={-360} max={360} step={0.1} value={Math.round(plan.image.rotation * 10) / 10} disabled={busy || formPending} onChange={e => rotateAll(Number(e.target.value))} />
            <span>°</span>
            <button type="button" aria-label="Girar todo un grado a la derecha" disabled={busy || formPending} onClick={() => rotateAll(plan.image!.rotation + 1)}>↷</button>
          </div>}
        </div>
        <p className={s.muted}>
          {tool === "SELECT"
            ? "Selecciona un elemento. Arrastra sus vértices para ajustar el contorno."
            : "Haz clic en los vértices, en orden, y pulsa Terminar dibujo. Para grupos dibuja exactamente cuatro vértices."}
        </p>
      </div>
      <div className={s.layout}>
        {view === "PLAN" ? (
          <SitePlanCanvas
            previewPaths={groupPreview}
            onComplete={(path) => {
              if (busy || lot || zone) return;
              setPoints(path);
              if (tool === "GROUP") return;
              completeDrawing(path);
            }}
            plan={previewPlan}
            tool={tool}
            points={points}
            selected={selected}
            showImage={showImage}
            onSelect={select}
            onPath={updatePath}
            onPoint={(p) => {
              if (!busy && plan.image && tool !== "SELECT" && !lot && !zone) {
                const next = [...points, p];
                setPoints(next);
                if (tool === "LOT" && next.length === 4) completeDrawing(next);
              }
            }}
          />
        ) : (
          <SitePlanMap
            focusPlanRequest={focusPlanRequest}
            moveAll={movingWholeBlock}
            focusProject={hasLocation}
            markers={projectMarkers}
            markerFocusId={hasLocation ? "project-location" : undefined}
            plan={previewPlan}
            center={center}
            showImage={showImage}
            selected={selected}
            tool="SELECT"
            points={points}
            onSelect={id => { if (!movingWholeBlock) select(id); }}
            onPath={updatePath}
            onPoint={(p) => {
              if (!busy && tool !== "SELECT" && !lot && !zone)
                setPoints((prev) => [...prev, p]);
            }}
            onMapCenter={(p) => {
              mapCenter.current = p;
            }}
            mapCenterRequest={centerRequest}
          />
        )}
        <aside
          ref={sidebar}
          className={s.sidebar}
          aria-label="Panel de herramientas del plano"
        >
          <nav className={s.panelTabs} aria-label="Apartados del editor">
            {(
              [
                ["BASE", "Excel y lotes"],
                ["IMAGE", "Plano"],
                ["ZONES", "Manzanas"],
                ["SUMMARY", "Resumen"],
              ] as const
            ).map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={activePanel === key ? s.active : ""}
                onClick={() => {
                  if (!confirmDiscard()) return;
                  closeForm();
                  setPanel(key);
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          {activePanel === "LOT" && !lot && (
            <section className={s.card}>
              <h2>Dibujar lote</h2>
              <p>
                Marca sus vértices sobre el plano y pulsa «Terminar dibujo».
                Aquí aparecerá su formulario.
              </p>
            </section>
          )}
          {activePanel === "ZONE" && !zone && (
            <section className={s.card}>
              <h2>Dibujar manzana</h2>
              <p>
                Escribe el nombre, marca el contorno y pulsa «Guardar manzana».
              </p>
            </section>
          )}
          {imported && activePanel === "BASE" && (
            <section className={s.card}>
              <h2>Revisar importación · {imported.length} lotes</h2>
              <p className={s.muted}>
                Coincidencia por manzana y código. Actualiza datos sin borrar
                polígonos ni los demás lotes.
              </p>
              <div className={s.preview}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Manzana</th>
                      <th>Área</th>
                      <th>Contado</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imported.slice(0, 100).map((l) => (
                      <tr key={l.id}>
                        <td>{l.code}</td>
                        <td>{l.block}</td>
                        <td>{l.areaM2} m²</td>
                        <td>{money(l.price)}</td>
                        <td>{LOT_LABELS[l.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={s.actions}>
                <button
                  disabled={busy || formPending}
                  className={s.primary}
                  onClick={applyImport}
                >
                  Aplicar base al borrador
                </button>
                <button onClick={() => setImported(undefined)}>
                  Cancelar importación
                </button>
              </div>
            </section>
          )}
          {lot && selected && (
            <div className={s.lotTabs}>
              <button
                type="button"
                className={!editingLot ? s.active : ""}
                onClick={() => setEditingLot(false)}
              >
                Ficha del lote
              </button>
              <button
                type="button"
                className={editingLot ? s.active : ""}
                onClick={() => setEditingLot(true)}
              >
                Editar datos
              </button>
            </div>
          )}
          {lot && selected && !editingLot && (
            <AdminLotDetail
              projectId={initial.project.id}
              plan={plan}
              lot={lot}
              currency={initial.project.currency}
              onView={() => {
                setView("PLAN");
                setShowImage(true);
              }}
              onClose={closeForm}
            />
          )}
          {lot && (!selected || editingLot) && (
            <details key={lot.id} className={s.card} open>
              <summary className={s.editSummary}>Editar ficha del lote</summary>
              <form className={s.fields} onSubmit={saveLot}>
                <h2>
                  {plan.lots.some((l) => l.id === lot.id)
                    ? "Editar lote"
                    : "Guardar lote"}
                </h2>
                {points.length >= 3 && !selected && plan.lots.some(l => l.fromExcel && !l.path.length) && (
                  <label>
                    N.º de lote de la base
                    <select
                      value={
                        plan.lots.some((l) => l.id === lot.id) ? lot.id : ""
                      }
                      onChange={(e) => {
                        const base = plan.lots.find(
                          (l) => l.id === e.target.value,
                        );
                        if (base) {
                          if (
                            base.path.length &&
                            !window.confirm(
                              "Este lote ya tiene un polígono. ¿Reemplazar su dibujo?",
                            )
                          )
                            return;
                          setLot({ ...base, path: points });
                        } else setLot(newLot(points));
                      }}
                    >
                      <option value="">Crear lote desde cero</option>
                      {plan.lots.filter(l => l.fromExcel && !l.path.length).map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.block ? `Mz. ${l.block} · ` : ""}
                          {l.code}
                          {l.path.length ? " (dibujado)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {text("N.º de lote *", "code", true)}
                <div className={s.grid}>
                  {text("Manzana", "block")}
                  {text("Calle / tramo", "street")}
                </div>
                <label>
                  Asignar manzana dibujada
                  <select
                    value=""
                    onChange={(e) => setLot({ ...lot, block: e.target.value })}
                  >
                    <option value="">Selecciona una manzana</option>
                    {plan.zones
                      .filter((z) => z.kind === "BLOCK")
                      .map((z) => (
                        <option key={z.id} value={z.name}>
                          {z.name}
                        </option>
                      ))}
                  </select>
                </label>

                {text("Dirección", "address")}
                <div className={s.grid}>
                  {numeric("Área m² *", "areaM2", 0.01)}
                  {numeric("Perímetro m", "perimeterM")}
                  <label>
                    Frente m
                    <input type="number" min="0" step="0.01" value={rectangularSides(lot.dimensions)?.front ?? lot.frontM} onChange={e => updateSide("front", Number(e.target.value))} />
                  </label>
                  <label>
                    Fondo / costado m
                    <input type="number" min="0" step="0.01" value={rectangularSides(lot.dimensions)?.depth || ""} placeholder="Ej. 18" onChange={e => updateSide("depth", Number(e.target.value))} />
                  </label>
                  <label>
                    Dimensiones (ej. 8 × 18 m)
                    <input maxLength={100} value={lot.dimensions} onChange={e => {
                      const dimensions = e.target.value;
                      const sides = rectangularSides(dimensions);
                      updateLotValues({ dimensions, ...(sides ? rectangularMetrics(sides.front, sides.depth) : {}) });
                    }} />
                  </label>
                  {text("Tipo (esquina, interior…)", "type")}
                  <label>
                    Estado
                    <select
                      value={lot.status}
                      onChange={(e) =>
                        setLot({
                          ...lot,
                          status: e.target.value as PlanLot["status"],
                        })
                      }
                    >
                      {Object.entries(LOT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  disabled={lot.path.length < 3}
                  onClick={() =>
                    updateLotValues(polygonMetrics(lot.path))
                  }
                >
                  Calcular área y perímetro del dibujo
                </button>
                <button type="button" disabled={lot.path.length < 3} onClick={() => {
                  const block = plan.zones.find(z => z.kind === "BLOCK" && z.name.trim().toLowerCase() === lot.block.trim().toLowerCase());
                  if (!block) { setError("Selecciona la manzana dibujada de este lote para ajustarlo a su borde."); return; }
                  const path = alignLotToBoundary(lot.path, block.path, plan.lots.filter(l => l.id !== lot.id).map(l => l.path));
                  if (!path) { setError("No hay un borde cercano con orientación compatible y espacio libre. Acerca el lote al borde y vuelve a ajustar."); return; }
                  setLot({ ...lot, path });
                  setPoints(path);
                  setError("");
                }}>Pegar lote al borde de su manzana</button>
                <label className={s.check}>
                  <input
                    type="checkbox"
                    checked={lot.cashAllowed}
                    onChange={(e) =>
                      setLot({ ...lot, cashAllowed: e.target.checked })
                    }
                  />
                  Venta al contado
                </label>
                <div className={s.grid}>
                  {numeric(
                    `Precio contado (${initial.project.currency})`,
                    "price",
                  )}
                  {numeric(
                    `Precio / m² (${initial.project.currency})`,
                    "priceM2",
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLot({
                      ...lot,
                      price: Math.round(lot.priceM2 * lot.areaM2 * 100) / 100,
                    })
                  }
                >
                  Calcular contado: área × precio/m²
                </button>
                <label className={s.check}>
                  <input
                    type="checkbox"
                    checked={lot.financingAllowed}
                    onChange={(e) => updateLotValues({ financingAllowed: e.target.checked, installments: lot.installments || 14 })}
                  />
                  Permitir financiamiento
                </label>
                {lot.financingAllowed && (
                  <>
                    <div className={s.grid}>
                      {numeric("Monto de venta antes de intereses", "financedPrice")}
                      {numeric("Cuota inicial", "downPayment")}
                      {numeric("Número de cuotas", "installments", 1, "1")}
                      {numeric("Tasa de interés mensual (%)", "interestRateMonthly")}
                      {numeric("Cuota mensual", "monthlyPayment")}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setLot({
                          ...lot,
                          monthlyPayment: monthlyInstallment(lot.financedPrice, lot.downPayment, lot.installments, lot.interestRateMonthly ?? 0),
                        })
                      }
                    >
                      Calcular cuotas con tasa mensual
                    </button>
                    <p className={s.muted}>Saldo: {money(Math.max(0, lot.financedPrice - lot.downPayment))} · Total con intereses: {money(lot.downPayment + lot.monthlyPayment * lot.installments)}</p>
                  </>
                )}
                <label>
                  Observaciones
                  <textarea
                    maxLength={2000}
                    value={lot.notes}
                    onChange={(e) => setLot({ ...lot, notes: e.target.value })}
                  />
                </label>
                <div className={s.actions}>
                  <button type="submit" className={s.primary}>
                    Guardar lote
                  </button>
                  <button type="button" onClick={closeForm}>
                    Cerrar forma
                  </button>
                  {selected && (
                    <button
                      className={s.danger}
                      type="button"
                      onClick={removeSelected}
                    >
                      Eliminar lote
                    </button>
                  )}
                </div>
              </form>
            </details>
          )}
          {(zone || tool === "BLOCK" || tool === "CONTOUR") && (
            <form
              key={zone?.id ?? "new-block"}
              className={`${s.card} ${s.fields}`}
              onSubmit={saveZone}
            >
              <h2>
                {zone?.kind === "CONTOUR" || tool === "CONTOUR" ? "Guardar contorno" : zone?.kind === "STREET" ? "Calle / tramo" : "Guardar manzana"}
              </h2>
              {zone?.kind !== "CONTOUR" && tool !== "CONTOUR" && <label>
                Nombre de la manzana *
                <input
                  required
                  maxLength={100}
                  autoFocus
                  placeholder="Ej. A o Los Pinos"
                  value={zone?.name ?? blockName}
                  onChange={(e) =>
                    zone
                      ? setZone({ ...zone, name: e.target.value })
                      : setBlockName(e.target.value)
                  }
                />
              </label>}
              <div className={s.actions}>
                <button
                  className={s.primary}
                  disabled={!zone && points.length < 3}
                >
                  {zone?.kind === "CONTOUR" || tool === "CONTOUR" ? "Guardar contorno" : "Guardar manzana"}
                </button>
                <button type="button" onClick={closeForm}>
                  Cerrar
                </button>
                {selected && (
                  <button
                    className={s.danger}
                    type="button"
                    onClick={removeSelected}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </form>
          )}
          {tool === "GROUP" && (
            <section className={`${s.card} ${s.fields}`}>
              <h2>Dividir franja por medidas</h2>
              <p>
                Marca las cuatro esquinas sobre tu plano. Revisa la división antes de generar los lotes.
              </p>
              <div className={s.grid}>
                <label>Frente de cada lote (m)<input type="number" min={0.01} step={0.01} value={groupFront} onChange={e => setGroupFront(Number(e.target.value))} /></label>
                <label>Fondo de cada lote (m)<input type="number" min={0.01} step={0.01} value={groupDepth} onChange={e => setGroupDepth(Number(e.target.value))} /></label>
              </div>
              <button type="button" onClick={() => setGroupDirection(v => !v)}>Cambiar sentido de división</button>
              <div className={s.notice}>{groupCount} lotes · {groupFront * groupDepth} m² cada uno · Frente total: {Math.round(groupCount * groupFront * 100) / 100} m</div>
              {groupProportionMismatch && <p role="status" className={s.error}>La proporción dibujada no coincide con frente y fondo. Revisa la franja, las medidas o cambia el sentido de división.</p>}
              <label>
                Manzana *
                <input
                  list="group-blocks"
                  value={groupBlock}
                  onChange={(e) => setGroupBlock(e.target.value)}
                />
                <datalist id="group-blocks">{plan.zones.filter(z => z.kind === "BLOCK").map(z => <option key={z.id} value={z.name} />)}</datalist>
              </label>
              <label>
                Calle
                <input
                  value={groupStreet}
                  onChange={(e) => setGroupStreet(e.target.value)}
                />
              </label>
              <div className={s.grid}>
                <label>
                  Cantidad
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={groupCount}
                    onChange={(e) => setGroupCount(Number(e.target.value))}
                  />
                </label>
                <label>
                  Numeración inicial
                  <input
                    type="number"
                    min={1}
                    value={groupStart}
                    onChange={(e) => setGroupStart(Number(e.target.value))}
                  />
                </label>
              </div>
              <button type="button" className={s.primary} disabled={groupPreview.length !== groupCount || busy} onClick={finish}>Generar {groupCount} lotes</button>
            </section>
          )}
          {tool === "GROUP" && (
            <section className={`${s.card} ${s.fields}`}>
              <h2>Datos comunes del grupo nuevo</h2>
              <p className={s.muted}>
                Se aplican a lotes creados desde cero. Los lotes de una base
                conservan sus datos.
              </p>
              <div className={s.grid}>
                {(
                  [
                    "price",
                    "financedPrice",
                    "downPayment",
                    "installments",
                  ] as const
                ).map((field) => (
                  <label key={field}>
                    {
                      {
                        areaM2: "Area oficial (0 = dibujo)",
                        price: "Precio contado",
                        financedPrice: "Total financiado",
                        downPayment: "Cuota inicial",
                        installments: "Cuotas",
                      }[field]
                    }
                    <input
                      type="number"
                      min={0}
                      step={field === "installments" ? "1" : "0.01"}
                      value={groupTerms[field]}
                      onChange={(e) =>
                        setGroupTerms({
                          ...groupTerms,
                          [field]: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <label className={s.check}>
                <input
                  type="checkbox"
                  checked={groupTerms.cashAllowed}
                  onChange={(e) =>
                    setGroupTerms({
                      ...groupTerms,
                      cashAllowed: e.target.checked,
                    })
                  }
                />
                Al contado
              </label>
              <label className={s.check}>
                <input
                  type="checkbox"
                  checked={groupTerms.financingAllowed}
                  onChange={(e) =>
                    setGroupTerms({
                      ...groupTerms,
                      financingAllowed: e.target.checked,
                    })
                  }
                />
                Financiado (cuotas calculadas sin intereses adicionales)
              </label>
            </section>
          )}
          {activePanel === "BASE" && (
            <section className={s.card}>
              <h2>Base de lotes · {plan.lots.length} lotes</h2>
              <p className={s.muted}>
                {plan.lots.filter((l) => l.path.length).length} dibujados ·{" "}
                {plan.lots.filter((l) => !l.path.length).length} por asignar.
                Puedes comenzar desde cero o importar una base.
              </p>
              <div className={s.actions}>
                <a className={s.button} href={fileUrl(`${basePath}/template`)}>
                  <FileSpreadsheet size={15} />
                  Plantilla Excel
                </a>
                <label className={s.button}>
                  <Upload size={15} />
                  Importar .xlsx
                  <input
                    hidden
                    type="file"
                    accept=".xlsx"
                    disabled={busy}
                    onChange={(e) => {
                      void importFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (!confirmDiscard()) return;
                    closeForm();
                    setTool("SELECT");
                    setLot(newLot());
                  }}
                >
                  Crear lote sin dibujo
                </button>
              </div>
              <button type="button" className="mt-3" disabled={busy} onClick={() => setShowLotTable(true)}>
                Ver cuadro de lotes / Descargar Excel o PDF
              </button>
            </section>
          )}
          {activePanel === "IMAGE" && (
            <section className={`${s.card} ${s.fields}`}>
              <h2>Imagen del plano y logos</h2>
              <label className={s.button}>
                <Upload size={15} />
                {plan.image ? "Reemplazar plano" : "Subir plano"}
                <input
                  hidden
                  type="file"
                  accept="application/pdf,.pdf,image/png,image/jpeg,image/webp"
                  disabled={busy}
                  onChange={(e) => {
                    void upload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {plan.image && (
                <>
                  {plan.image.sourcePdfUrl && (
                    <a href={plan.image.sourcePdfUrl} target="_blank" rel="noopener noreferrer" className={s.button}>
                      PDF original · Página {plan.image.sourcePdfPage ?? 1}
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={busy || !hasLocation || formPending}
                    onClick={() => {
                      relocatePlan(center);
                      setView("MAP");
                      setCenterRequest((n) => n + 1);
                    }}
                  >
                    Colocar plano en el punto del proyecto
                  </button>
                  <p className={s.muted}>
                    Mueve el mapa y usa «Situar en el centro» para alinear la
                    imagen. Ocultarla conserva los polígonos.
                  </p>
                  <button
                    disabled={busy}
                    onClick={() =>
                      relocatePlan(mapCenter.current)
                    }
                  >
                    Situar plano en el centro del mapa
                  </button>
                  <div className={s.grid}>
                    {(["lat", "lng"] as const).map((axis) => (
                      <label key={axis}>
                        {axis === "lat"
                          ? "Latitud del plano"
                          : "Longitud del plano"}
                        <input
                          type="number"
                          step="0.0000001"
                          value={plan.image!.center[axis]}
                          onChange={(e) =>
                            change({
                              ...plan,
                              image: {
                                ...plan.image!,
                                center: {
                                  ...plan.image!.center,
                                  [axis]: Number(e.target.value),
                                },
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                    {(["widthM", "heightM", "rotation"] as const).map(
                      (field) => (
                        <label key={field}>
                          {
                            {
                              widthM: "Ancho (m)",
                              heightM: "Alto (m)",
                              rotation: "Giro (grados)",
                            }[field]
                          }
                          <input
                            type="number"
                            step="0.1"
                            min={field === "rotation" ? -360 : 1}
                            max={field === "rotation" ? 360 : 100000}
                            value={plan.image![field]}
                            onChange={(e) =>
                              change({
                                ...plan,
                                image: {
                                  ...plan.image!,
                                  [field]: Number(e.target.value),
                                },
                              })
                            }
                          />
                        </label>
                      ),
                    )}
                  </div>
                  <label>
                    Opacidad
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={plan.image.opacity}
                      onChange={(e) =>
                        change({
                          ...plan,
                          image: {
                            ...plan.image!,
                            opacity: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </label>
                </>
              )}
              <label className={s.button}>
                <Upload size={15} />
                {plan.logoUrl
                  ? "Cambiar logo del proyecto"
                  : "Subir logo del proyecto"}
                <input
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={busy}
                  onChange={(e) => {
                    void upload(e.target.files?.[0], true);
                    e.target.value = "";
                  }}
                />
              </label>
              <p className={s.muted}>
                {plan.logoUrl
                  ? "Logo del proyecto cargado."
                  : "Carga el logo del proyecto para incluirlo en las fichas PDF."}{" "}
                El logo de ARIZ se incluye automáticamente.
              </p>
            </section>
          )}
          {activePanel === "SUMMARY" && (
            <section className={s.card}>
              <h2>Resumen del plano</h2>
              <div className={s.grid}>
                <div className={s.metric}>
                  Lotes<strong>{plan.lots.length}</strong>
                </div>
                <div className={s.metric}>
                  Área total
                  <strong>
                    {plan.lots
                      .reduce((n, l) => n + l.areaM2, 0)
                      .toLocaleString("es-PE")}{" "}
                    m²
                  </strong>
                </div>
                {Object.entries(LOT_LABELS).map(([status, label]) => (
                  <div className={s.metric} key={status}>
                    {label}
                    <strong>
                      {plan.lots.filter((l) => l.status === status).length}
                    </strong>
                  </div>
                ))}
                <div className={s.metric}>
                  Valor contado
                  <strong>
                    {money(
                      plan.lots
                        .filter((l) => l.cashAllowed)
                        .reduce((n, l) => n + l.price, 0),
                    )}
                  </strong>
                </div>
              </div>
            </section>
          )}
          {(activePanel === "ZONES" || activePanel === "ZONE") && (
            <section className={s.card}>
              {plan.zones.some(z => z.kind === "CONTOUR") && <>
                <h2>Contornos</h2>
                <div className={s.list}>
                  {plan.zones.filter(z => z.kind === "CONTOUR").map(z => <button type="button" key={z.id} className={s.row} onClick={() => select(z.id)}>{z.name}<Pencil size={15} /></button>)}
                </div>
              </>}
              <h2>
                Manzanas ({plan.zones.filter((z) => z.kind === "BLOCK").length})
              </h2>
              <div className={s.list}>
                {plan.zones
                  .filter((z) => z.kind === "BLOCK")
                  .map((z) => (
                    <button
                      className={s.row}
                      key={z.id}
                      onClick={() => select(z.id)}
                    >
                      <span>
                        {z.name}
                        <small>
                          {z.kind === "BLOCK" ? "Manzana" : "Calle"} ·{" "}
                          {
                            plan.lots.filter((l) =>
                              z.kind === "BLOCK"
                                ? l.block === z.name
                                : l.street === z.name,
                            ).length
                          }{" "}
                          lotes
                        </small>
                      </span>
                      <Pencil size={15} />
                    </button>
                  ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </fieldset>
  );
}
