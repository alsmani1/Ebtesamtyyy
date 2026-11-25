import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export default function AdminIndexPage() {
  return <MinyaRoleModulePage role="clinic_owner" moduleSlug="reports" currentUser={null} />;
}
