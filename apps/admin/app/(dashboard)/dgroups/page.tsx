import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = {
  title: "DGroups",
};

export default function DGroupsPage() {
  return (
    <PlaceholderPage
      eyebrow="DGroups"
      title="DGroups"
      description="DGroups activity will land here after the ministry team starts publishing."
    />
  );
}
