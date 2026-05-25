import { redirect } from "next/navigation";

export default function SettingsMemoryRedirect() {
  redirect("/settings/profile");
}
