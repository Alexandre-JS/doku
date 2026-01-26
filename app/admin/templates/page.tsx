import { Suspense } from "react";
import AdminTemplatesPageClient from "./AdminTemplatesPageClient";

export default function AdminTemplatesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">Carregando...</div>
    </div>}>
      <AdminTemplatesPageClient />
    </Suspense>
  );
}
