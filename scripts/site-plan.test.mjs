import test from "node:test";
import { measuredLotGroup } from "../src/shared/lib/site-plan.ts";
import assert from "node:assert/strict";
import {
  polygonLabel,
  fitPolygonText,
} from "../src/shared/lib/polygon-label.ts";

test("full block names shrink and wrap to stay inside their own polygon", () => {
  for (const name of [
    "A",
    "Los Pinos",
    "Manzana de Las Palmeras",
    "UnNombreMuyLargoSinEspacios",
  ]) {
    const fitted = fitPolygonText(name, 8);
    assert.ok(fitted.size <= 12);
    assert.ok(
      Math.max(...fitted.lines.map((line) => Array.from(line).length)) *
        fitted.size <=
        8 * 1.25 + 1e-8,
    );
    assert.ok(fitted.lines.length * fitted.size * 1.2 <= 8 * 1.25 + 1e-8);
    assert.equal(
      fitted.lines.join("").replaceAll(" ", ""),
      name.replaceAll(" ", ""),
    );
  }
});
test("wide blocks keep complete names horizontal without splitting words", () => {
  const path = [
    { x: 0, y: 0 },
    { x: 300, y: 0 },
    { x: 300, y: 40 },
    { x: 0, y: 40 },
  ];
  const anchor = polygonLabel(path);
  const fitted = fitPolygonText("Los Pinos", anchor.radius, 12, path, anchor);
  assert.deepEqual(fitted.lines, ["Los Pinos"]);
  assert.equal(fitted.angle, 0);
  assert.ok(fitted.size > 11);
});
test("block shape determines text direction for horizontal, vertical and slanted blocks equally", () => {
  const rectangle = [
    { x: -150, y: -20 },
    { x: 150, y: -20 },
    { x: 150, y: 20 },
    { x: -150, y: 20 },
  ];
  for (const degrees of [0, 27, 63, 90, -42]) {
    const radians = (degrees * Math.PI) / 180;
    const path = rectangle.map((p) => ({
      x: p.x * Math.cos(radians) - p.y * Math.sin(radians),
      y: p.x * Math.sin(radians) + p.y * Math.cos(radians),
    }));
    const anchor = polygonLabel(path);
    const fitted = fitPolygonText("Los Pinos", anchor.radius, 12, path, anchor);
    const difference = Math.abs(
      ((((fitted.angle - degrees + 270) % 180) + 180) % 180) - 90,
    );
    assert.ok(
      difference < 0.01,
      `shape ${degrees} degrees, label ${fitted.angle} degrees`,
    );
    assert.deepEqual(fitted.lines, ["Los Pinos"]);
  }
});

test("block letters stay inside a concave block where the bounding-box center is outside", () => {
  const polygon = [
    { x: 0, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 6 },
    { x: 0, y: 6 },
  ];
  const label = polygonLabel(polygon);
  assert.ok(label.x > 0 && label.y > 0);
  assert.ok(label.x < 1 || label.y < 1);
  assert.ok(label.radius > 0.49);
});
test("block letters center in a rectangular block and fit a narrow irregular block", () => {
  const center = polygonLabel([
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 4 },
    { x: 0, y: 4 },
  ]);
  assert.deepEqual(center, { x: 5, y: 2, radius: 2 });
  const narrow = polygonLabel([
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 9, y: 11 },
    { x: -1, y: 1 },
  ]);
  assert.ok(narrow.radius > 0 && narrow.radius < 1);
});
import { polygonMetrics, splitQuad } from "../src/shared/lib/site-plan.ts";
import { imageToGeo, geoToImage, placeImageAnchor } from "../src/shared/lib/plan-coordinates.ts";

test("placing a distant drawing centers its real outline rather than image whitespace", () => {
  const image = { url: 'plan.png', center: { lat: -12, lng: -77 }, widthM: 1200, heightM: 800, rotation: 37, opacity: 1 };
  const uv = { x: 0.12, y: 0.85 };
  const anchor = imageToGeo(uv, image);
  const target = { lat: -5.2, lng: -80.6 };
  const next = placeImageAnchor(image, anchor, target);
  const placed = imageToGeo(geoToImage(anchor, image), next);
  assert.ok(Math.abs(placed.lat - target.lat) < 1e-10);
  assert.ok(Math.abs(placed.lng - target.lng) < 1e-10);
  assert.equal(next.rotation, image.rotation);
  assert.equal(next.widthM, image.widthM);
});

test("scaling the whole plan keeps the drawing anchor fixed", () => {
  const image = { url: 'plan.png', center: { lat: -12, lng: -77 }, widthM: 250, heightM: 400, rotation: 23, opacity: 1 };
  const uv = { x: 0.2, y: 0.7 };
  const anchor = imageToGeo(uv, image);
  const scaled = { ...image, widthM: image.widthM * 1.05, heightM: image.heightM * 1.05 };
  const next = placeImageAnchor(scaled, imageToGeo(uv, scaled), anchor);
  const actual = imageToGeo(uv, next);
  assert.ok(Math.abs(actual.lat - anchor.lat) < 1e-10);
  assert.ok(Math.abs(actual.lng - anchor.lng) < 1e-10);
  assert.equal(next.widthM, 262.5);
  assert.equal(next.heightM, 420);
});

test("image coordinates round trip with rotation, zoom-independent scale and geographic position", () => {
  for (const rotation of [-180, -45, 0, 30, 90, 180]) {
    const image = {
      url: "",
      center: { lat: -12.0464, lng: -77.0428 },
      widthM: 250,
      heightM: 700,
      rotation,
      opacity: 1,
    };
    for (const point of [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 0.2, y: 0.8 },
    ]) {
      const restored = geoToImage(imageToGeo(point, image), image);
      assert.ok(Math.abs(point.x - restored.x) < 1e-8);
      assert.ok(Math.abs(point.y - restored.y) < 1e-8);
    }
  }
});
test("recalibration preserves the drawn lot position on the plan image", () => {
  const old = {
    url: "",
    center: { lat: -12, lng: -77 },
    widthM: 100,
    heightM: 200,
    rotation: 0,
    opacity: 1,
  };
  const aligned = {
    ...old,
    center: { lat: -12.01, lng: -77.01 },
    widthM: 300,
    heightM: 600,
    rotation: 55,
  };
  const uv = { x: 0.32, y: 0.81 };
  const transformed = imageToGeo(geoToImage(imageToGeo(uv, old), old), aligned);
  const restored = geoToImage(transformed, aligned);
  assert.ok(Math.abs(uv.x - restored.x) < 1e-8);
  assert.ok(Math.abs(uv.y - restored.y) < 1e-8);
});

const rectangle = [
  { lat: -12, lng: -77 },
  { lat: -12, lng: -76.999 },
  { lat: -12.001, lng: -76.999 },
  { lat: -12.001, lng: -77 },
];
test("lot metrics account for latitude and close the polygon perimeter", () => {
  const metrics = polygonMetrics(rectangle);
  assert.ok(metrics.areaM2 > 12000 && metrics.areaM2 < 12200);
  assert.ok(metrics.perimeterM > 439 && metrics.perimeterM < 442);
  assert.deepEqual(polygonMetrics([]), { areaM2: 0, perimeterM: 0 });
});
test("group division creates contiguous individual lots with equal areas", () => {
  const parts = splitQuad(rectangle, 10);
  assert.equal(parts.length, 10);
  const areas = parts.map((part) => polygonMetrics(part).areaM2);
  assert.ok(Math.max(...areas) - Math.min(...areas) < 0.03);
  for (let i = 0; i < parts.length - 1; i++) {
    assert.deepEqual(parts[i][1], parts[i + 1][0]);
    assert.deepEqual(parts[i][2], parts[i + 1][3]);
  }
  assert.ok(
    Math.abs(
      areas.reduce((a, b) => a + b, 0) - polygonMetrics(rectangle).areaM2,
    ) < 0.1,
  );
});
test("a trapezoid splits into equal areas rather than equal side fractions", () => {
  const trapezoid = [
    rectangle[0],
    rectangle[1],
    { lat: -12.002, lng: -76.999 },
    rectangle[3],
  ];
  const areas = splitQuad(trapezoid, 8).map(
    (part) => polygonMetrics(part).areaM2,
  );
  assert.ok(Math.max(...areas) - Math.min(...areas) < 0.05);
});
test("group division rejects incomplete geometry and invalid lot counts", () => {
  assert.throws(() => splitQuad(rectangle.slice(0, 3), 4));
  assert.throws(() => splitQuad(rectangle, 101));
  assert.throws(() => splitQuad(rectangle, 2.5));
  assert.throws(() =>
    splitQuad([rectangle[0], rectangle[0], rectangle[0], rectangle[0]], 4),
  );
});

test("measured groups preserve supplied dimensions and share every adjoining boundary", () => {
  for (const alternate of [false, true]) {
    const lots = measuredLotGroup(rectangle, 4, 10, 16, alternate);
    assert.equal(lots.length, 4);
    lots.forEach((lot, i) => {
      assert.equal(lot.areaM2, 160);
      assert.equal(lot.perimeterM, 52);
      assert.equal(lot.frontM, 10);
      assert.equal(lot.dimensions, '10 × 16 m');
      if (i < lots.length - 1) {
        assert.deepEqual(lot.path[1], lots[i + 1].path[0]);
        assert.deepEqual(lot.path[2], lots[i + 1].path[3]);
      }
    });
  }
  assert.throws(() => measuredLotGroup(rectangle, 4, 0, 16));
  assert.throws(() => measuredLotGroup(rectangle, 4, 10, NaN));
});
