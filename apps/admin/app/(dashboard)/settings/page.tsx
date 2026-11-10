import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Church"
      title="Settings"
      description="Manage ministry team access and church-wide publishing preferences."
    />
  );
}
