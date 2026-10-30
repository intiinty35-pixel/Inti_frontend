This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Imagen Docker

Desde esta carpeta, completa las variables públicas de Firebase y de pagos en `.env` y ejecuta:

```powershell
pnpm run docker:build
```

El comando pasa únicamente las variables públicas permitidas como argumentos de compilación y crea `roberto523/app-arisproyectos-frontend:latest`. El archivo `.env` permanece fuera de la imagen. La API usa `/api` y el sitio usa el dominio de producción configurado en el Dockerfile.

Para otra etiqueta: `pnpm run docker:build -- mi-frontend:latest`.
Vuelve a compilar la imagen cuando cambies Firebase o los datos públicos de pago.

## Desarrollo local

First, run the development server:

Este proyecto usa pnpm (la versión está fijada en `packageManager`; actívala con `corepack enable`).

```bash
pnpm install
pnpm dev
```

Tests: `pnpm test`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# Ariz_Web_frontend" 
