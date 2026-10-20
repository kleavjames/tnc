import { ResourcesView } from "@/components/resources-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
};

export default function ResourcesPage() {
  return <ResourcesView />;
}
