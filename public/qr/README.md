# Código QR de pago

`qr.png` es un **placeholder**. Reemplázalo por el código QR real de Yape de la
empresa antes de publicar el sitio.

## Cómo reemplazarlo

1. Exporta el QR desde la app de Yape (Yape → tu perfil → "Mi QR") a PNG.
2. Guarda el archivo sobreescribiendo `public/qr/qr.png`.
3. Verifica que el QR corresponde a la **cuenta de la empresa**, no a una
   cuenta personal, porque lo escanean clientes.
4. Prueba el flujo completo: Panel → Planes → Activar plan, y confirma que el
   QR se ve nítido en móvil.

## Importante

`public/qr/*.png` está en `.gitignore`: un QR de cobro apunta a una cuenta real y
no debe quedar en el historial del repositorio. El componente
`plan-request-modal.tsx` muestra este QR solo cuando `NEXT_PUBLIC_PAYMENT_YAPE_NUMBER`
o `NEXT_PUBLIC_PAYMENT_PLIN_NUMBER` tienen un valor real; si están vacíos, la
sección de pago no se renderiza.
