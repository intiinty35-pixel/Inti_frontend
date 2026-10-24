import type { PlanCrop, PlanImage, Point, SitePlan } from "./site-plan";

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
