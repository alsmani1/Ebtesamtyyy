import React from "react";
import MinyaRoleModulePage from "@/components/workspace/MinyaRoleModulePage";

export default function InventoryIndexPage() {
  return <MinyaRoleModulePage role="clinic_owner" moduleSlug="inventory" currentUser={null} />;
}
