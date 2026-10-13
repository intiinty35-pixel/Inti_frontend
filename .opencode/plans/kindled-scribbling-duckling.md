# Plan: Simplificar puntos de campaña y enlaces compartibles

## Contexto

El usuario quiere simplificar la lógica de puntos de campaña:

- **Puntos individuales**: Los que gana el referente por referido (se pueden canjear en /rewards)
- **Puntos de campaña**: 2 puntos adicionales que gana cuando un referido se registra en un proyecto con campaña activa

Ambos se ganan automáticamente, no hay que elegir.

## Lógica actual (incorrecta)

Los puntos de campaña se otorgan cuando el referido cambia de estado (CONTACTED → VISIT → OPERATION_COMPLETED).

## Lógica correcta (a implementar)

```
Referido se registra (se crea con status CONTACTED)
         ↓
Gana puntos normales (según ReferralStatusPoint)
         ↓
¿El proyecto tiene campaña activa?
    ↓ Sí              ↓ No
+2 pts campaña      Solo pts normales
(guardar una vez)
```

**Los puntos de campaña NO cambian con los estados. Solo se otorgan UNA VEZ al registrarse.**

## Cambios necesarios

### 1. Schema.prisma - Ajustar CampaignReferralPoints

```prisma
model CampaignReferralPoints {
  id              String         @id @default(uuid())
  referrerId      String
  campaignId      String
  referralId      String         @unique  // Ya está como unique, correcto
  points          Int            @default(2)  // Siempre 2 puntos
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  referrer        Referrer       @relation(fields: [referrerId], references: [id], onDelete: Cascade)
  campaign        Campaign       @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  referral        Referral       @relation(fields: [referralId], references: [id], onDelete: Cascade)

  @@map("campaign_referral_points")
}
```

- Quitar campo `status` (no necesitamos trackear el estado)
- Quitar constraint `@@unique([campaignId, referralId, status])` → dejar solo `referralId @unique`

### 2. CampaignPointsTracker - Simplificar

```typescript
async processReferralRegistration(
  referrerId: string,
  referralId: string,
  projectId: string | null,
): Promise<number> {
  // 1. Si no hay proyecto, no hay campaña
  if (!projectId) return 0;

  // 2. Buscar campaña activa para este proyecto
  const now = new Date();
  const campaign = await this.prisma.campaign.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      projects: { some: { projectId } },
    },
  });

  if (!campaign) return 0;

  // 3. Verificar si ya se otorgaron puntos (previene duplicados)
  const existing = await this.prisma.campaignReferralPoints.findUnique({
    where: { referralId },
  });

  if (existing) return 0; // Ya otorgado

  // 4. Otorgar 2 puntos de campaña
  await this.prisma.campaignReferralPoints.create({
    data: {
      referrerId,
      campaignId: campaign.id,
      referralId,
      points: 2,
    },
  });

  return 2;
}
```

### 3. ReferralsService.create() - Integrar tracker

```typescript
async create(dto: CreateReferralDto, changedById?: string | null) {
  // ... código existente para crear referido ...

  // Después de crear el referido:
  // Otorgar puntos de campaña si aplica
  const campaignPoints = await this.campaignTracker.processReferralRegistration(
    referrer.id,
    created.id,
    dto.projectId ?? null,
  );

  return { ...created, points: points.points, totalPoints, campaignPoints };
}
```

### 4. Frontend /rewards - Mostrar ambos saldos

```typescript
// En rewards/page.tsx, después de validar código:
const [individualPoints, setIndividualPoints] = useState(0);
const [campaignPoints, setCampaignPoints] = useState(0);

// Mostrar:
// - Tus puntos individuales: X pts (canjeables)
// - Tus puntos de campaña: Y pts (tracking)
```

### 5. Enlaces de campaña (futuro)

Para que el referente pueda compartir un enlace de campaña:

```
Formato: /rewards/campaign/[campaignSlug]?ref=[referrerCode]
Ejemplo: /rewards/campaign/verano-2026?ref=APCOD-12345678
```

Al visitar este enlace:
1. Mostrar info de la campaña
2. Precargar el código del referente
3. Al registrarse, asociar a campaña + referente
4. Otorgar 2 puntos de campaña automáticamente

## Archivos a modificar

### Backend
1. `prisma/schema.prisma` - Ajustar CampaignReferralPoints
2. `src/modules/campaigns/campaign-points-tracker.ts` - Simplificar
3. `src/modules/referrals/referrals.service.ts` - Integrar tracker en create()
4. `src/modules/referrals/dto/create-referral.dto.ts` - Agregar projectId opcional

### Frontend
5. `src/features/rewards/api/client.ts` - Actualizar getMyCampaignPoints
6. `src/features/rewards/types/rewards.ts` - Actualizar tipos
7. `src/app/(public)/rewards/page.tsx` - Mostrar ambos saldos
8. `src/features/referrals/components/referral-modal.tsx` - Agregar projectId al submit

### Páginas nuevas (futuro)
9. `src/app/(public)/rewards/campaign/[slug]/page.tsx` - Página pública de campaña

## Orden de implementación

1. **Primero**: Ajustar schema y migrar DB
2. **Segundo**: Simplificar CampaignPointsTracker
3. **Tercero**: Integrar en ReferralsService.create()
4. **Cuarto**: Actualizar frontend para mostrar ambos saldos
5. **Quinto**: Agregar projectId al modal de referidos
6. **Sexto** (futuro): Crear páginas de campaña pública

## Pruebas

- [ ] Crear campaña con proyecto asociado
- [ ] Registrar referido con projectId → debe ganar pts normales + 2 pts campaña
- [ ] Registrar referido sin projectId → solo pts normales
- [ ] Registrar mismo email dos veces → no duplicar puntos
- [ ] Verificar saldos separados en /rewards
