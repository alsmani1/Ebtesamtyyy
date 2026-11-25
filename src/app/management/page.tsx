import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export default function ManagementIndexPage() {
  return <MinyaRoleModulePage role="clinic_owner" moduleSlug="dashboard" currentUser={null} />;
}
