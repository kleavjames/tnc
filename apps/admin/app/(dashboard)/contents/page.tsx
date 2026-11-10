import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = {
  title: "Contents",
};

export default function ContentsPage() {
  return (
    <PlaceholderPage
      eyebrow="Content"
      title="Contents"
      description="Manage the contents of the church website."
    />
  );
}
