# Plan: Arreglar puntos de campaña que no aparecen en /rewards

## Problema identificado

El usuario registró un referido usando código de campaña, pero en `/rewards` no aparecen los puntos de campaña del referido. Sin embargo, en el panel de admin sí aparece el referido.

## Flujo esperado

1. Usuario valida código de campaña → obtiene `campaign.id`
2. Usuario crea referido con `campaignCode`
3. Backend valida código y obtiene `campaignId`
4. Backend crea `Referral` con `campaignId`
5. Backend crea registro en `CampaignReferralPoints` con puntos
6. Frontend consulta `GET /referrals/my-campaign-points?code=XXX`
7. Backend retorna puntos desde `CampaignReferralPoints`

## Problemas identificados en el código

### 1. Backend - `referrals.service.ts` (línea 302-309)
```typescript
// Si el referido tiene campaña, registrar puntos de campaña para el estado inicial
if (campaignId) {
  await this.campaignTracker.processReferralStatusChange(
    created.referrerId,
    created.id,
    campaignId,
    ReferralStatus.CONTACTED,
  );
}
```
**Problema**: Esto se ejecuta DESPUÉS de la transacción, pero el `campaignId` ya debería estar disponible.

### 2. Backend - `campaign-points-tracker.ts`
El método `processReferralStatusChange()` ahora requiere `campaignId` como parámetro:
```typescript
async processReferralStatusChange(
  referrerId: string,
  referralId: string,
  campaignId: string,
  status: ReferralStatus,
): Promise<number>
```
**Problema**: Antes buscaba el `campaignId` del `Referral`, ahora lo recibe como parámetro. Esto está correcto.

### 3. Frontend - `rewards/page.tsx`
La función `getMyCampaignPoints()` consulta el endpoint correcto.

## Plan de acción

### Paso 1: Verificar que el `campaignId` se esté guardando en `Referral`

Necesito verificar en la base de datos si el referido creado tiene el `campaignId` guardado.

**Consulta SQL para verificar:**
```sql
SELECT id, name, email, "campaignId", "createdAt" 
FROM referrals 
WHERE name = 'Roberto Lopez'
ORDER BY "createdAt" DESC
LIMIT 1;
```

### Paso 2: Verificar que existan registros en `CampaignReferralPoints`

**Consulta SQL para verificar:**
```sql
SELECT * 
FROM campaign_referral_points 
WHERE "referrerId" = '<ID_DEL_REFERENTE>'
ORDER BY "createdAt" DESC;
```

### Paso 3: Si no existen registros, hay dos posibilidades:

#### Posibilidad A: El `campaignCode` no se está enviando desde el frontend

Revisar el componente `referral-modal.tsx` para verificar que se está enviando el `campaignCode` en el payload.

**Verificar líneas 306 y 322:**
```typescript
campaignCode: validatedCampaign ? campaignCode.trim() : undefined,
```

#### Posibilidad B: El `campaignCode` se envía pero no se valida correctamente

Revisar el método `validateCampaignCode()` en `campaigns.service.ts` para asegurar que:
1. Normaliza el código (uppercase)
2. Busca la campaña
3. Valida que esté activa y dentro del periodo
4. Retorna el `campaignId`

### Paso 4: Agregar logs de debugging

Agregar logs en `referrals.service.ts` para verificar:
1. Si se recibe el `campaignCode`
2. Si la validación es exitosa
3. Si se obtiene el `campaignId`
4. Si se llama a `processReferralStatusChange()`

### Paso 5: Verificar el endpoint `GET /referrals/my-campaign-points`

Verificar que el endpoint:
1. Recibe el código del referente
2. Busca el `referrerId`
3. Llama a `getReferrerCampaignPointsBreakdown()`
4. Retorna los puntos correctamente

## Posibles soluciones

### Solución 1: Si el `campaignId` no se guarda en `Referral`

Agregar validación para asegurar que el `campaignCode` se convierta en `campaignId` antes de crear el referido.

### Solución 2: Si los puntos no se crean en `CampaignReferralPoints`

Verificar que `processReferralStatusChange()` se esté ejecutando correctamente y que no haya errores.

### Solución 3: Si el endpoint no retorna los puntos

Verificar que `getReferrerCampaignPointsBreakdown()` esté consultando correctamente la tabla `CampaignReferralPoints`.

## Próximos pasos

1. Ejecutar las consultas SQL para verificar el estado actual de los datos
2. Según los resultados, aplicar la solución correspondiente
3. Agregar logs de debugging si es necesario
4. Probar el flujo completo nuevamente
