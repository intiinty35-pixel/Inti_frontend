/**
 * Vista previa de un proyecto ya publicado. Es una proyección plana del modelo
 * de `listings`, declarada aquí para que el asistente de creación no dependa de
 * otra feature: cualquier `Project` es asignable a este tipo.
 */
export interface ProjectPreview {
  id: string;
  name: string;
  developer: string;
  location: {
    department: string;
    province: string;
    district: string;
  };
  startingPrice: {
    amount: number;
    currency: string;
  };
  areaRange: {
    min: number;
    max: number;
  };
  lotsTotal?: number;
  lotsLabel?: string;
  deliveryStage?: string;
  deliveryAt?: string;
  status?: string;
}
