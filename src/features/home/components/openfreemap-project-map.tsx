"use client";

import { useEffect, useRef } from "react";
import OLMap from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import View from "ol/View.js";
import { defaults as defaultControls } from "ol/control/defaults.js";
import { boundingExtent } from "ol/extent.js";
import { fromLonLat } from "ol/proj.js";
import { apply } from "ol-mapbox-style";
import "ol/ol.css";
import type { MapPoint } from "@/features/listings/components/listings-map";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const LA_PAZ_CENTER: [number, number] = [-68.1193, -16.4897];

function makePopup(point: MapPoint, onClose: () => void) {
  const popup = document.createElement("article");
  popup.className = "inti-openfreemap-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-label", `Proyecto ${point.title}`);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "inti-openfreemap-popup-close";
  close.setAttribute("aria-label", "Cerrar detalle del proyecto");
  close.textContent = "×";
  close.addEventListener("click", onClose);
  popup.append(close);

  if (point.badge) {
    const badge = document.createElement("span");
    badge.className = "inti-openfreemap-popup-badge";
    badge.textContent = point.badge;
    popup.append(badge);
  }

  const price = document.createElement("p");
  price.className = "inti-openfreemap-popup-price";
  price.textContent = point.priceLabel;
  popup.append(price);

  const title = document.createElement("h3");
  title.className = "inti-openfreemap-popup-title";
  title.textContent = point.title;
  popup.append(title);

  const district = document.createElement("p");
  district.className = "inti-openfreemap-popup-district";
  district.textContent = point.districtLabel;
  popup.append(district);

  const link = document.createElement("a");
  link.className = "inti-openfreemap-popup-link";
  link.href = point.href;
  link.textContent = "Ver proyecto";
  popup.append(link);

  return popup;
}

export function OpenFreeMapProjectMap({
  points,
  className,
}: {
  points: readonly MapPoint[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new OLMap({
      target: containerRef.current,
      layers: [],
      view: new View({ center: fromLonLat(LA_PAZ_CENTER), zoom: 12 }),
      controls: defaultControls({ rotate: false }),
    });

    void apply(map, MAP_STYLE);

    let activePopup: Overlay | null = null;
    points.forEach((point) => {
      const coordinate = fromLonLat([point.lng, point.lat]);
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "inti-openfreemap-marker";
      marker.setAttribute("aria-label", `Ver ${point.title} en el mapa`);

      const markerImage = document.createElement("img");
      markerImage.src = "/web_v/ubicacion.png";
      markerImage.alt = "";
      markerImage.width = 38;
      markerImage.height = 44;
      marker.append(markerImage);

      const popupElement = makePopup(point, () => {
        activePopup?.setPosition(undefined);
        activePopup = null;
      });
      popupElement.hidden = true;

      const popup = new Overlay({
        element: popupElement,
        positioning: "bottom-center",
        offset: [0, -52],
        stopEvent: true,
        autoPan: { animation: { duration: 250 } },
      });
      map.addOverlay(popup);

      const pin = new Overlay({
        element: marker,
        positioning: "bottom-center",
        stopEvent: false,
      });
      pin.setPosition(coordinate);
      map.addOverlay(pin);

      marker.addEventListener("click", () => {
        activePopup?.setPosition(undefined);
        if (activePopup === popup) {
          activePopup = null;
          popupElement.hidden = true;
          return;
        }
        popupElement.hidden = false;
        popup.setPosition(coordinate);
        activePopup = popup;
      });
    });

    if (points.length === 1) {
      map.getView().setCenter(fromLonLat([points[0].lng, points[0].lat]));
      map.getView().setZoom(13);
    } else if (points.length > 1) {
      const extent = boundingExtent(points.map((point) => fromLonLat([point.lng, point.lat])));
      map.getView().fit(extent, { padding: [88, 88, 88, 88], maxZoom: 13, duration: 600 });
    }

    return () => {
      map.setTarget(undefined);
      map.dispose();
    };
  }, [points]);

  return <div ref={containerRef} className={className} aria-label="Mapa de proyectos con OpenFreeMap" />;
}
