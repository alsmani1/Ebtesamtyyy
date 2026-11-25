import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export function generateStaticParams() {
  return [
    { module: "dashboard" },
    { module: "appointments" },
    { module: "patients" },
    { module: "exam-room" },
    { module: "imaging" },
    { module: "lab" },
    { module: "inventory" },
    { module: "inbox" },
    { module: "attendance" },
    { module: "reports" },
  ];
}

export default async function DoctorModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <MinyaRoleModulePage
        role="doctor"
        moduleSlug={module}
        currentUser={null}
      />
    </React.Suspense>
  );
}
