import type { PlanImage, Point } from "./site-plan";

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
