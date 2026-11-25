import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export function generateStaticParams() {
  return [
    { module: "dashboard" },
    { module: "appointments" },
    { module: "patients" },
    { module: "finance" },
    { module: "lab" },
    { module: "inventory" },
    { module: "crm" },
    { module: "inbox" },
    { module: "attendance" },
    { module: "reviews" },
  ];
}

export default async function ReceptionModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <MinyaRoleModulePage
        role="receptionist"
        moduleSlug={module}
        currentUser={null}
      />
    </React.Suspense>
  );
}
