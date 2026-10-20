import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = {
  title: "Speakers",
};

export default function SpeakersPage() {
  return (
    <PlaceholderPage
      eyebrow="Content"
      title="Speakers"
      description="Keep a directory of pastors and guest speakers connected to each sermon."
    />
  );
}
