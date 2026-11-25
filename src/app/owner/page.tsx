import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export default function OwnerIndexPage() {
  return <MinyaRoleModulePage role="clinic_owner" moduleSlug="dashboard" currentUser={null} />;
}
