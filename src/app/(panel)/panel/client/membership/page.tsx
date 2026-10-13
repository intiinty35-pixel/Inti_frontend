import { CustomerMembershipManager } from "@/features/customer-account/components/customer-membership-manager";
import { getCustomerMembership, getCustomerProfile } from "@/features/customer-account/api/server";

export default async function PanelClientMembershipPage() {
  const [membership, profile] = await Promise.all([
    getCustomerMembership(),
    getCustomerProfile(),
  ]);

  const customerName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
          Planes y suscripción
        </p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
          Elige el paquete para tus publicaciones
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
          La primera propiedad es gratis por 30 días. Después, selecciona uno de los tres paquetes
          y envía el comprobante; el administrador activará los beneficios al aprobarlo.
        </p>
      </header>
      <CustomerMembershipManager membership={membership} customerName={customerName} />
    </div>
  );
}
