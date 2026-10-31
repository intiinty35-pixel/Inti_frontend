"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FieldSet, useFieldError } from "@/shared/ui/field-shell";
import { SearchCombobox } from "@/shared/ui/combobox";
import { NumericField, TextField } from "@/shared/ui/rhf-fields";
import { Button } from "@/shared/ui/button";
import { CrosshairIcon, MapIcon, PinIcon } from "@/shared/ui/icons";
import { GoogleMapsLinkField } from "@/shared/ui/google-maps-link-field";
import { LocationPicker, preloadLocationPicker, type MapPoint } from "@/shared/ui/location-picker";
import { buildAddressQuery, searchMapPlace } from "@/shared/lib/geo";
import { BOLIVIA_DEPARTMENTS } from "@/shared/data/bolivia-locations";
import type { ProjectDraft } from "@/features/projects/types/draft";

const DEPARTMENT_OPTIONS = BOLIVIA_DEPARTMENTS.map((department) => ({ value: department, label: department }));
const FALLBACK_CENTER: MapPoint = { latitude: -17.783333, longitude: -63.182126 };

export function StepLocation() {
  const { setValue, clearErrors, getValues } = useFormContext<ProjectDraft>();
  const [department, province, district, lat, lng] = useWatch({
    name: ["department", "province", "district", "lat", "lng"],
  });
  const [placeLabel, setPlaceLabel] = useState("");
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState("");

  const departmentError = useFieldError<ProjectDraft>("department");
  const latError = useFieldError<ProjectDraft>("lat");
  const lngError = useFieldError<ProjectDraft>("lng");

  useEffect(() => {
    void preloadLocationPicker();
  }, []);

  const center: MapPoint =
    typeof lat === "number" && typeof lng === "number"
      ? { latitude: lat, longitude: lng }
      : FALLBACK_CENTER;

  const hasPoint = typeof lat === "number" && Number.isFinite(lat) && Math.abs(lat) <= 90
    && typeof lng === "number" && Number.isFinite(lng) && Math.abs(lng) <= 180;

  function applyPoint(next: MapPoint) {
    setPlaceLabel("");
    setMapError("");
    setValue("lat", next.latitude, { shouldDirty: true, shouldValidate: true });
    setValue("lng", next.longitude, { shouldDirty: true, shouldValidate: true });
    clearErrors(["lat", "lng"]);
  }

  function useCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      applyPoint({
        latitude: Number(position.coords.latitude.toFixed(7)),
        longitude: Number(position.coords.longitude.toFixed(7)),
      });
    });
  }

  async function locateAddress() {
    const draft = getValues();
    const parts = [draft.street, draft.streetNumber, draft.district, draft.province, draft.department];

    if (!buildAddressQuery(parts)) {
      setMapError("Completa la direccion antes de ubicarla en el mapa.");
      return;
    }

    setLocating(true);
    setMapError("");

    try {
      const place = await searchMapPlace(parts);

      if (!place) {
        setMapError("No encontramos esa direccion. Ajusta el distrito o la referencia.");
        return;
      }

      applyPoint({ latitude: place.latitude, longitude: place.longitude });
      setPlaceLabel(place.label);
    } catch {
      setMapError("No pudimos consultar el mapa. Intentalo nuevamente.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldSet
        legend="Ubicación en Bolivia"
        description="Selecciona el departamento e indica la provincia y el municipio."
        required
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <SearchCombobox
            label="Departamento"
            placeholder="Selecciona el departamento"
            options={DEPARTMENT_OPTIONS}
            value={department ?? ""}
            error={departmentError}
            required
            onValueChange={(option) => {
              setValue("department", option.value, { shouldDirty: true });
              setValue("province", "", { shouldDirty: true });
              setValue("district", "", { shouldDirty: true });
              clearErrors(["department", "province", "district"]);
            }}
          />
          <TextField<ProjectDraft>
            name="province"
            label="Provincia"
            placeholder="Ej. Andrés Ibáñez"
            required
          />
          <TextField<ProjectDraft>
            name="district"
            label="Municipio"
            placeholder="Ej. Santa Cruz de la Sierra"
            required
          />
        </div>
      </FieldSet>

      <FieldSet legend="Dirección exacta">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField<ProjectDraft>
            name="zone"
            label="Zona"
            placeholder="Zona A, sector Norte"
            hint="Barrio, sector o zona de la ubicación."
          />
          <TextField<ProjectDraft>
            name="street"
            label="Calle, avenida o manzana"
            placeholder="Av. Los Álamos"
          />
          <TextField<ProjectDraft>
            name="streetNumber"
            label="Número o lote"
            placeholder="Mz. A Lt. 14"
          />
        </div>
      </FieldSet>

      <FieldSet
        legend="Punto en el mapa"
        description="Obligatorio. Arrastra el marcador, haz click en el mapa o ingresa las coordenadas para fijar la ubicación del proyecto."
        required
      >
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand">
              {hasPoint ? "Ubicación fijada en el mapa." : "Aún no has fijado la ubicación."}
            </p>
            <p className="truncate text-xs text-muted">
              {placeLabel || "Ubica la dirección o arrastra el marcador."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={useCurrentLocation}
              disabled={locating}
            >
              <CrosshairIcon className="h-4 w-4" />
              Usar mi ubicación
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => void locateAddress()} disabled={locating}>
              <MapIcon className="h-4 w-4" />
              {locating ? "Ubicando..." : "Ubicar dirección"}
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <GoogleMapsLinkField onPoint={applyPoint} />
        </div>

        <LocationPicker
          latitude={center.latitude}
          longitude={center.longitude}
          onChange={applyPoint}
        />

        {mapError ? (
          <p className="mt-2 text-sm text-error" role="alert">
            {mapError}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumericField<ProjectDraft>
            name="lat"
            label="Latitud"
            placeholder="-17.7833"
            step="any"
            inputMode="decimal"
            error={latError}
          />
          <NumericField<ProjectDraft>
            name="lng"
            label="Longitud"
            placeholder="-63.1821"
            step="any"
            inputMode="decimal"
            error={lngError}
          />
        </div>
      </FieldSet>

      <div className="flex items-start gap-2 rounded-card bg-surface-muted p-3 text-xs text-muted">
        <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          {district
            ? `${district}, ${province}, ${department}.`
            : "Indica el municipio, la provincia y el departamento de Bolivia."}
        </p>
      </div>
    </div>
  );
}
