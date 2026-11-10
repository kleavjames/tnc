import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = {
  title: "Members",
};

export default function MembersPage() {
  return (
    <PlaceholderPage
      eyebrow="Content"
      title="Members"
      description="Manage the members of the church."
    />
  );
}
