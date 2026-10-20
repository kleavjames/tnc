import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = {
  title: "Media library",
};

export default function MediaPage() {
  return (
    <PlaceholderPage
      eyebrow="Content"
      title="Media library"
      description="Store sermon audio, notes, and downloadable files in one place."
    />
  );
}
