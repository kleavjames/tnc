import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <PlaceholderPage
      eyebrow="Overview"
      title="Dashboard"
      description="Sermon and article activity will land here after the ministry team starts publishing."
    />
  );
}
