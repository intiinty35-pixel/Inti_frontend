import test from "node:test";
import { measuredLotGroup, repeatedLotGroup, lotNumberRange, blockLotGroup } from "../src/shared/lib/site-plan.ts";
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

test("reversing group numbering preserves the subdivision in both directions", () => {
  for (const direction of [false, true]) {
    const forward = measuredLotGroup(rectangle, 10, 8, 18, direction);
    const reversed = measuredLotGroup(rectangle, 10, 8, 18, direction, true);
    assert.deepEqual(reversed, [...forward].reverse());
  }
});

test("group division rejects crossed, concave, repeated and nonfinite corners", () => {
  assert.throws(() => splitQuad([rectangle[0], rectangle[2], rectangle[1], rectangle[3]], 10));
  assert.throws(() => splitQuad([rectangle[0], rectangle[1], { lat: -12.0002, lng: -76.9998 }, rectangle[3]], 10));
  assert.throws(() => splitQuad([rectangle[0], rectangle[1], rectangle[1], rectangle[3]], 10));
  assert.throws(() => splitQuad([{ lat: NaN, lng: -77 }, ...rectangle.slice(1)], 10));
  assert.equal(splitQuad([...rectangle].reverse(), 10).length, 10);
});

test("manual lot ranges include both endpoints and support descending numbers", () => {
  assert.deepEqual(lotNumberRange(11, 20), [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  assert.deepEqual(lotNumberRange(5, 2), [5, 4, 3, 2]);
  assert.deepEqual(lotNumberRange(8, 8), [8]);
  assert.equal(lotNumberRange(101, 200).length, 100);
  for (const [a, b] of [[0, 10], [1, 101], [2.5, 5], [1, NaN], [Infinity, 5]])
    assert.throws(() => lotNumberRange(a, b));
});

test("repeating a first lot preserves vertical, horizontal and rotated shapes in all directions", () => {
  const close = (a, b) => Math.abs(a - b) < 1e-10;
  for (const angle of [0, 90, 37, -45]) {
    const radians = angle * Math.PI / 180;
    const rotate = (x, y) => ({ lat: -12 + (x * Math.sin(radians) + y * Math.cos(radians)) / 111320, lng: -77 + (x * Math.cos(radians) - y * Math.sin(radians)) / (111320 * Math.cos(-12 * Math.PI / 180)) });
    const seed = [rotate(0, 0), rotate(8, 0), rotate(8, 18), rotate(0, 18)];
    for (const direction of [{ lat: 0, lng: 1 }, { lat: 0, lng: -1 }, { lat: 1, lng: 0 }, { lat: -1, lng: 0 }]) {
      const lots = repeatedLotGroup(seed, 10, 8, 18, direction);
      assert.equal(lots.length, 10);
      for (let i = 0; i < 4; i++) {
        assert.ok(close(lots[0].path[i].lat, seed[i].lat));
        assert.ok(close(lots[0].path[i].lng, seed[i].lng));
      }
      for (let i = 0; i < lots.length; i++) {
        const lot = lots[i];
        assert.equal(lot.areaM2, 144);
        assert.ok(Math.abs(polygonMetrics(lot.path).areaM2 - 144) < 0.05);
        if (i === 0) continue;
        const previous = lots[i - 1].path;
        const sharedCorners = lot.path.filter(p => previous.some(q => close(p.lat, q.lat) && close(p.lng, q.lng)));
        assert.equal(sharedCorners.length, 2, `rotation ${angle}: adjoining lots share exactly one edge`);
      }
      assert.deepEqual(repeatedLotGroup(seed, 10, 8, 18, direction, true), [...lots].reverse());
    }
  }
});

test("repetition straightens opposite sides and rejects invalid inputs", () => {
  const seed = rectangle.map(p => ({ ...p }));
  seed[2].lng += 0.00001;
  const lots = repeatedLotGroup(seed, 3, 8, 18, { lat: 0, lng: 1 });
  const delta = (a, b) => ({ lat: b.lat - a.lat, lng: b.lng - a.lng });
  const a = delta(lots[0].path[0], lots[0].path[1]);
  const b = delta(lots[0].path[3], lots[0].path[2]);
  assert.ok(Math.abs(a.lat - b.lat) < 1e-10 && Math.abs(a.lng - b.lng) < 1e-10);
  assert.equal(repeatedLotGroup(rectangle, 1, 8, 18, { lat: 0, lng: 1 }).length, 1);
  assert.throws(() => repeatedLotGroup(rectangle, 0, 8, 18, { lat: 0, lng: 1 }));
  assert.throws(() => repeatedLotGroup(rectangle, 101, 8, 18, { lat: 0, lng: 1 }));
  assert.throws(() => repeatedLotGroup(rectangle, 3, 8, 18, { lat: 0, lng: 0 }));
  assert.throws(() => repeatedLotGroup(rectangle.slice(0, 3), 3, 8, 18, { lat: 0, lng: 1 }));
});

test("a group contour distributes six model lots in rows for horizontal, vertical and angled drawings", () => {
  for (const degrees of [0, 90, 37]) {
    const radians = degrees * Math.PI / 180;
    const point = (x, y) => ({ lat: -12 + (x * Math.sin(radians) + y * Math.cos(radians)) / 111320, lng: -77 + (x * Math.cos(radians) - y * Math.sin(radians)) / (111320 * Math.cos(-12 * Math.PI / 180)) });
    const boundary = [point(0, 0), point(24, 0), point(24, 36), point(0, 36)];
    const seed = [point(0, 0), point(8, 0), point(8, 18), point(0, 18)];
    const lots = blockLotGroup(boundary, seed, 6, 8, 18);
    assert.equal(lots.length, 6);
    assert.equal(new Set(lots.map(l => JSON.stringify(l.path))).size, 6);
    assert.ok(Math.abs(lots.reduce((n, l) => n + polygonMetrics(l.path).areaM2, 0) - polygonMetrics(boundary).areaM2) < 0.1);
    lots[0].path.forEach((p, i) => {
      assert.ok(Math.abs(p.lat - seed[i].lat) < 1e-10 && Math.abs(p.lng - seed[i].lng) < 1e-10);
    });
    assert.deepEqual(blockLotGroup(boundary, seed, 6, 8, 18, true), [...lots].reverse());
    assert.equal(blockLotGroup(boundary, seed, 7, 8, 18).length, 7);
  }
});

test("group contours accept the first lot even when it extends outside", () => {
  const point = (x, y) => ({ lat: -12 + y / 111320, lng: -77 + x / (111320 * Math.cos(-12 * Math.PI / 180)) });
  const rect = (x, y, w, h) => [point(x, y), point(x + w, y), point(x + w, y + h), point(x, y + h)];
  const boundary = rect(0, 0, 24, 36), seed = rect(0, 0, 8, 18);
  assert.equal(blockLotGroup(boundary, seed, 6, 8, 18).length, 6);
  assert.equal(blockLotGroup(seed, seed, 1, 8, 18).length, 1);
  assert.equal(blockLotGroup(boundary, rect(16, 18, 8, 18), 1, 8, 18).length, 1);
  assert.equal(blockLotGroup(boundary, rect(1, 1, 8, 18), 1, 8, 18).length, 1);
  for (const outside of [rect(-1, 0, 8, 18), rect(17, 18, 8, 18), rect(0, 19, 8, 18)])
    assert.equal(blockLotGroup(boundary, outside, 1, 8, 18).length, 1);
  const separateGroup = rect(50, 0, 16, 18);
  assert.equal(blockLotGroup(separateGroup, rect(50, 0, 8, 18), 2, 8, 18).length, 2);
});

test("concave group contours do not place lots across a notch", () => {
  const point = (x, y) => ({ lat: -12 + y / 111320, lng: -77 + x / (111320 * Math.cos(-12 * Math.PI / 180)) });
  const boundary = [[0,0], [24,0], [24,18], [8,18], [8,36], [0,36]].map(([x,y]) => point(x,y));
  const seed = [[0,0], [8,0], [8,18], [0,18]].map(([x,y]) => point(x,y));
  assert.equal(blockLotGroup(boundary, seed, 4, 8, 18).length, 4);
  assert.equal(blockLotGroup(boundary, seed, 5, 8, 18).length, 5);
  assert.throws(() => blockLotGroup([boundary[0], boundary[2], boundary[1], boundary[5]], seed, 2, 8, 18), /cruzarse/);
});

test("the requested count adjusts the model to fill a convex group and recalculates actual measurements", () => {
  const point = (x, y) => ({ lat: -12 + y / 111320, lng: -77 + x / (111320 * Math.cos(-12 * Math.PI / 180)) });
  const boundary = [[0,0], [16,0], [16,18], [0,18]].map(([x,y]) => point(x,y));
  const seed = [[0,0], [8,0], [8,18], [0,18]].map(([x,y]) => point(x,y));
  for (const count of [1, 4, 7, 100]) {
    const lots = blockLotGroup(boundary, seed, count, 8, 18);
    assert.equal(lots.length, count);
    const expectedArea = polygonMetrics(boundary).areaM2 / count;
    for (const lot of lots) {
      const actual = polygonMetrics(lot.path);
      assert.equal(lot.areaM2, actual.areaM2);
      assert.equal(lot.perimeterM, actual.perimeterM);
      assert.ok(Math.abs(lot.areaM2 - expectedArea) <= 0.02);
      lot.path.forEach(p => {
        assert.ok(p.lat >= boundary[0].lat - 1e-10 && p.lat <= boundary[2].lat + 1e-10);
        assert.ok(p.lng >= boundary[0].lng - 1e-10 && p.lng <= boundary[2].lng + 1e-10);
      });
    }
    assert.ok(Math.abs(lots.reduce((n, l) => n + l.areaM2, 0) - polygonMetrics(boundary).areaM2) <= count * 0.01);
  }
  const four = blockLotGroup(boundary, seed, 4, 8, 18);
  assert.equal(four[0].frontM, 8);
  assert.equal(four[0].dimensions, "8 × 9 m");
});
