import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export function generateStaticParams() {
  return [
    { module: "dashboard" },
    { module: "appointments" },
    { module: "patients" },
    { module: "clinical-audit" },
    { module: "finance" },
    { module: "expenses" },
    { module: "profitability" },
    { module: "inventory" },
    { module: "lab" },
    { module: "crm" },
    { module: "inbox" },
    { module: "attendance" },
    { module: "reviews" },
    { module: "reports" },
  ];
}

export default async function OwnerModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <MinyaRoleModulePage
        role="clinic_owner"
        moduleSlug={module}
        currentUser={null}
      />
    </React.Suspense>
  );
}
