"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { logout } from "@/features/auth/api/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      await logout();
    } finally {
      router.push(ROUTES.login);
      router.refresh();
    }
  }

  return (
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleClick} disabled={loading}>
      Cerrar sesión
    </Button>
  );
}
