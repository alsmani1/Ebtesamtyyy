import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export function generateStaticParams() {
  return [
    { module: "dashboard" },
    { module: "appointments" },
    { module: "treatment-plan" },
    { module: "imaging" },
    { module: "billing" },
    { module: "inbox" },
    { module: "reviews" },
  ];
}

export default async function PatientModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <MinyaRoleModulePage
        role="patient"
        moduleSlug={module}
        currentUser={null}
      />
    </React.Suspense>
  );
}
