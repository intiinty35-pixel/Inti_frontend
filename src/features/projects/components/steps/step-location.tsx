"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FieldSet, useFieldError } from "@/shared/ui/field-shell";
import { SearchCombobox } from "@/shared/ui/combobox";
import { NumericField, TextField } from "@/shared/ui/rhf-fields";
import { Button } from "@/shared/ui/button";
import { CrosshairIcon, MapIcon, PinIcon } from "@/shared/ui/icons";
import { LocationPicker, preloadLocationPicker, type MapPoint } from "@/shared/ui/location-picker";
import { buildAddressQuery, searchMapPlace } from "@/shared/lib/geo";
import {
  PERU_DEPARTMENTS,
  PERU_PLACE_OPTIONS,
  buildDistrictOptions,
  buildProvinceOptions,
  getDistricts,
  parsePlaceValue,
} from "@/shared/data/peru-locations";
import type { ProjectDraft } from "@/features/projects/types/draft";

const DEPARTMENT_OPTIONS = PERU_DEPARTMENTS.map((department) => ({ value: department, label: department }));
const FALLBACK_CENTER: MapPoint = { latitude: -12.046374, longitude: -77.042793 };

export function StepLocation() {
  const { setValue, clearErrors, getValues } = useFormContext<ProjectDraft>();
  const [department, province, district, lat, lng] = useWatch({
    name: ["department", "province", "district", "lat", "lng"],
  });
  const [placeLabel, setPlaceLabel] = useState("");
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState("");

  const departmentError = useFieldError<ProjectDraft>("department");
  const provinceError = useFieldError<ProjectDraft>("province");
  const districtError = useFieldError<ProjectDraft>("district");
  const latError = useFieldError<ProjectDraft>("lat");
  const lngError = useFieldError<ProjectDraft>("lng");

  const hasDepartment = Boolean(department);
  const hasProvince = Boolean(province);

  useEffect(() => {
    void preloadLocationPicker();
  }, []);

  const center: MapPoint =
    typeof lat === "number" && typeof lng === "number"
      ? { latitude: lat, longitude: lng }
      : FALLBACK_CENTER;

  const hasPoint = typeof lat === "number" && typeof lng === "number";

  function applyRegion(next: Partial<Pick<ProjectDraft, "department" | "province" | "district">>) {
    const patch: Array<[keyof ProjectDraft, string]> = [];

    if (next.department !== undefined) {
      patch.push(["department", next.department]);
    }

    if (next.province !== undefined) {
      patch.push(["province", next.province]);
    }

    if (next.district !== undefined) {
      patch.push(["district", next.district]);
    }

    for (const [field, value] of patch) {
      setValue(field, value as never, { shouldDirty: true });
    }

    clearErrors(["department", "province", "district"]);
  }

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
        legend="Buscar ubicación"
        description="Escribe el distrito, la provincia o el departamento y elígelo de la lista."
      >
        <SearchCombobox
          label="Buscar por nombre"
          placeholder="Buscar distrito, provincia o departamento"
          emptyLabel="Sin coincidencias. Usa los selectores de abajo."
          options={PERU_PLACE_OPTIONS}
          onValueChange={(option) => {
            const location = parsePlaceValue(option.value);

            if (location) {
              applyRegion(location);
            }
          }}
        />
      </FieldSet>

      <FieldSet
        legend="Jerarquía administrativa"
        description="Los tres niveles son obligatorios y deben corresponderse entre sí."
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
            onValueChange={(option) => applyRegion({ department: option.value, province: "", district: "" })}
          />
          <SearchCombobox
            label="Provincia"
            placeholder={hasDepartment ? "Selecciona la provincia" : "Elige antes el departamento"}
            options={buildProvinceOptions(department ?? "")}
            value={province ?? ""}
            error={provinceError}
            required
            emptyLabel={hasDepartment ? "Sin provincias" : "Elige un departamento"}
            onValueChange={(option) => applyRegion({ province: option.value, district: "" })}
          />
          <SearchCombobox
            label="Distrito"
            placeholder={hasProvince ? "Selecciona el distrito" : "Elige antes la provincia"}
            options={buildDistrictOptions(department ?? "", province ?? "")}
            value={district ?? ""}
            error={districtError}
            required
            emptyLabel={hasProvince ? "Sin distritos" : "Elige una provincia"}
            onValueChange={(option) => applyRegion({ district: option.value })}
          />
        </div>
      </FieldSet>

      <FieldSet legend="Dirección exacta" required>
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
            required
          />
          <TextField<ProjectDraft>
            name="streetNumber"
            label="Número o lote"
            placeholder="Mz. A Lt. 14"
            required
          />
        </div>
      </FieldSet>

      <FieldSet
        legend="Punto en el mapa"
        description="Opcional. Arrastra el marcador o haz click en el mapa para fijar la ubicación del proyecto."
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
            placeholder="-12.0464"
            step="any"
            inputMode="decimal"
            error={latError}
          />
          <NumericField<ProjectDraft>
            name="lng"
            label="Longitud"
            placeholder="-77.0428"
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
            : "Aún no eliges el distrito."}{" "}
          {hasProvince ? `${getDistricts(department ?? "", province ?? "").length} distritos en ${province}.` : null}
        </p>
      </div>
    </div>
  );
}
