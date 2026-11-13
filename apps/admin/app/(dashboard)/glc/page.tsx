import type { Metadata } from "next";
import { GlcAttendanceView } from "../../../components/glc-attendance-view";
import { listGlcAttendance } from "../../../lib/glc";

export const metadata: Metadata = {
  title: "Global Leadership Center",
};

export default async function GLCPage() {
  const attendance = await listGlcAttendance();
  return <GlcAttendanceView attendance={attendance} />;
}
