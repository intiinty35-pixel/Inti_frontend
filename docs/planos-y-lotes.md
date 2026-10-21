# Planos y lotes

En **Admin → Todos los proyectos → Editar plano y lotes** se administra el inventario de cualquier proyecto. La sección «Proyectos ARIZ» conserva su catálogo propio.

## Preparación

- La clave del navegador se lee de `Ariz_Web_frontend/.env`: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Docker Compose toma el argumento de compilación del `.env` de la raíz; `docker:build` toma el del frontend. Cambiar la clave en producción requiere recompilar el frontend.
- Google Cloud debe tener Maps JavaScript API y facturación habilitadas. Autoriza el dominio de la aplicación y localhost para desarrollo en las restricciones de sitios web de la clave.
- `BillingNotEnabledMapError` significa que falta activar la facturación del proyecto de Google Cloud asociado a la clave. La aplicación no puede activarla por código.
- La migración `20261020000000_project_site_plans` crea la tabla de borradores y publicaciones. En despliegues nuevos se aplica con las demás migraciones.
- El logo de ARIZ para PDF está en `Ariz_Web_Backend_REPO/assets/ariz-logo.png`; Docker lo incluye automáticamente.

## Editor

1. Conserva las coordenadas originales del proyecto. Si no tiene coordenadas, defínelas primero en «Editar proyecto».
2. Sube obligatoriamente un plano PNG, JPG o WebP antes de dibujar. La vista inicial «Dibujar sobre plano» permite trazar directamente sobre la imagen, con zoom, sin depender de que Google Maps cargue. Usa «Alinear en Google Maps» para ajustar centro, ancho, alto y giro hasta que coincida con el terreno. Los dibujos acompañan los ajustes de alineación para conservar su posición sobre la imagen.
3. Dibuja manzanas y calles marcando sus vértices en orden. Pulsa «Terminar dibujo», escribe el nombre y guarda la forma.
4. Para un lote, marca al menos tres puntos y termina el dibujo. En el panel derecho puedes crear su ficha o asignarle un lote existente de la base.
5. Para un grupo, marca cuatro vértices en orden. La división sigue el primer lado y produce lotes independientes de igual área. Si hay lotes sin dibujo en la manzana indicada, se asignan en el orden de la base; de lo contrario se crean usando la numeración y condiciones comunes indicadas.
6. Selecciona un polígono o una ficha de la base para editarlo. Arrastra los vértices o el contorno para corregir su posición. «Deshacer» recupera cambios recientes del borrador.
7. Guarda primero el formulario abierto y después el borrador del plano. «Publicar plano» actualiza el inventario público; el proyecto también debe estar publicado para que pueda consultarse.

El plano no necesita una base previa. Los lotes también pueden crearse sin dibujo y asignarse después. Las áreas y perímetros calculados a partir del mapa son aproximados y pueden reemplazarse por medidas oficiales. No se deben interpretar como un levantamiento topográfico.

Cada lote tiene código, manzana, calle, dirección, tipo, dimensiones, área, perímetro, frente y estado. Puede venderse al contado, financiado o de ambas formas. El financiamiento guarda precio total, inicial, número de cuotas y cuota mensual; el cálculo auxiliar divide el saldo sin agregar intereses. Las condiciones adicionales se escriben en observaciones.

## Excel

Descarga la plantilla desde el editor. Se admiten archivos `.xlsx` de hasta 3 MB y 5000 filas de lotes. La primera hoja debe contener encabezados. La importación presenta una revisión antes de aplicarse al borrador.

| Columna                                                   | Contenido                                  |
| --------------------------------------------------------- | ------------------------------------------ |
| `codigo`                                                  | Código obligatorio del lote                |
| `manzana`, `calle`, `direccion`                           | Ubicación dentro del proyecto              |
| `area_m2`                                                 | Área obligatoria mayor que cero            |
| `perimetro_m`, `frente_m`, `dimensiones`, `tipo`          | Medidas y clasificación                    |
| `precio_contado`, `precio_m2`                             | Precio total y por metro cuadrado          |
| `estado`                                                  | disponible, reservado, vendido o bloqueado |
| `contado`, `financiado`                                   | si / no                                    |
| `precio_financiado`, `inicial`, `cuotas`, `cuota_mensual` | Condiciones de financiamiento              |
| `notas`                                                   | Observaciones                              |

La coincidencia usa **manzana + código**, sin distinguir mayúsculas. Una fila coincidente actualiza su ficha y conserva el identificador y el dibujo. Los lotes restantes permanecen en el proyecto. Los códigos repetidos en una misma manzana y los importes inválidos se rechazan.

## Publicación y PDF

Guardar un borrador no cambia lo que ve el visitante. La publicación conserva una copia del plano y sincroniza el inventario en una transacción. Si otro administrador guardó primero, se solicita recargar para evitar sobrescribir su trabajo. El detalle público del proyecto puede tardar hasta 60 segundos en refrescar su caché.

La vista pública permite ocultar la imagen sin ocultar los polígonos, filtrar lotes y consultar su ficha con precios y financiamiento. La imagen se oculta al alejarse por debajo del nivel de zoom 15. Las fichas se descargan como PDF con el logo de ARIZ y el logo del proyecto que se haya cargado en el editor.

El mapa general y el mapa del buscador de proyectos usan Google Maps. Al acercarse a zoom 15 o más se cargan bajo demanda los planos de hasta cuatro proyectos cercanos al centro de la vista. Sus lotes también pueden seleccionarse y descargarse desde el mapa general.

## Verificación

El editor acepta planos PDF de hasta 30 MB. Al importarlos permite elegir una página y girarla; genera una imagen de hasta 6000 píxeles por lado (20 megapíxeles como máximo) para dibujar. Conserva el PDF original y la página elegida junto al borrador. El apartado Plano permite abrir el original. Los PDF protegidos con contraseña requieren una copia sin protección.

Los comandos `dev` y `build` preparan los recursos locales de PDF.js en `public/pdfjs`; no dependen de un CDN externo para leer el documento.

- Frontend: `node --experimental-strip-types --test scripts/site-plan.test.mjs`
- Backend: `pnpm test --runInBand --runTestsByPath src/modules/projects/site-plans.spec.ts`
- Compilación: `pnpm build` en cada repositorio.
