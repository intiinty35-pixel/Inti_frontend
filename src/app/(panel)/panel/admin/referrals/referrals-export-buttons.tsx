"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function ReferralsExportButtons({ query = "" }: { query?: string }) {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  async function handleExportExcel() {
    setLoadingExcel(true);
    try {
      const response = await fetch(`/api/admin/referrals/export/excel${query ? `?${query}` : ""}`);
      if (!response.ok) throw new Error("Error al exportar");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `miembros-y-puntos-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error al exportar a Excel. Intenta nuevamente.");
    } finally {
      setLoadingExcel(false);
    }
  }

  async function handleExportPdf() {
    setLoadingPdf(true);
    try {
      const response = await fetch(`/api/admin/referrals/export/pdf${query ? `?${query}` : ""}`);
      if (!response.ok) throw new Error("Error al exportar");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `miembros-y-puntos-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error al exportar a PDF. Intenta nuevamente.");
    } finally {
      setLoadingPdf(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="md"
        onClick={handleExportExcel}
        disabled={loadingExcel || loadingPdf}
        className="border-2 border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
      >
        {loadingExcel ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}
        Excel
      </Button>
      <Button
        variant="secondary"
        size="md"
        onClick={handleExportPdf}
        disabled={loadingExcel || loadingPdf}
        className="border-2 border-red-400 text-red-400 hover:bg-red-50 bg-transparent"
      >
        {loadingPdf ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
        PDF
      </Button>
    </div>
  );
}
