import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export default function PatientIndexPage() {
  return <MinyaRoleModulePage role="patient" moduleSlug="dashboard" currentUser={null} />;
}
