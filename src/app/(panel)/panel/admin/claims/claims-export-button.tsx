"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function ClaimsExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/claims/export/pdf");
      if (!response.ok) throw new Error("Error al exportar");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `libro-reclamaciones-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error al exportar el PDF. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="md" onClick={handleExport} disabled={loading} className="shrink-0 border-2 border-red-400 text-red-400 hover:bg-red-50 bg-transparent">
      {loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
      Exportar PDF
    </Button>
  );
}
