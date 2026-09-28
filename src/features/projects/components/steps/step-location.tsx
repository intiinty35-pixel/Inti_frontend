"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FieldSet, useFieldError } from "@/shared/ui/field-shell";
import { SearchCombobox } from "@/shared/ui/combobox";
import { NumericField, TextField } from "@/shared/ui/rhf-fields";
import { Button } from "@/shared/ui/button";
import { CrosshairIcon, PinIcon } from "@/shared/ui/icons";
import {
  PERU_DEPARTMENTS,
  PERU_PLACE_OPTIONS,
  buildDistrictOptions,
  buildProvinceOptions,
  getDistricts,
  parsePlaceValue,
} from "@/features/projects/data/peru-locations";
import type { ProjectDraft } from "@/features/projects/types/draft";

const DEPARTMENT_OPTIONS = PERU_DEPARTMENTS.map((department) => ({ value: department, label: department }));

export function StepLocation() {
  const { setValue, clearErrors } = useFormContext<ProjectDraft>();
  const [department, province, district] = useWatch({
    name: ["department", "province", "district"],
  });

  const departmentError = useFieldError<ProjectDraft>("department");
  const provinceError = useFieldError<ProjectDraft>("province");
  const districtError = useFieldError<ProjectDraft>("district");

  const hasDepartment = Boolean(department);
  const hasProvince = Boolean(province);

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

  function useCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setValue("lat", position.coords.latitude, { shouldDirty: true });
      setValue("lng", position.coords.longitude, { shouldDirty: true });
      clearErrors(["lat", "lng"]);
    });
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
        legend="Coordenadas"
        description="Opcionales, pero mejoran la búsqueda por mapa del portal."
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <NumericField<ProjectDraft>
            name="lat"
            label="Latitud"
            placeholder="-12.0464"
            step="any"
            inputMode="decimal"
          />
          <NumericField<ProjectDraft>
            name="lng"
            label="Longitud"
            placeholder="-77.0428"
            step="any"
            inputMode="decimal"
          />
          <Button type="button" variant="secondary" onClick={useCurrentLocation} className="h-10">
            <CrosshairIcon className="h-4 w-4" />
            Usar mi ubicación
          </Button>
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
