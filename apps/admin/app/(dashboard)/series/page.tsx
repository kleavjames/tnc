import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = {
  title: "Series",
};

export default function SeriesPage() {
  return (
    <PlaceholderPage
      eyebrow="Content"
      title="Series"
      description="Group sermons into teaching series so the church can follow along week by week."
    />
  );
}
