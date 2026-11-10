import type { Metadata } from "next";
import { PendingMembersView } from "../../../../components/pending-members-view";
import { listMembers } from "../../../../lib/members";

export const metadata: Metadata = {
  title: "Pending registrations",
};

export default async function PendingMembersPage() {
  const members = await listMembers("pending");
  return <PendingMembersView members={members} />;
}
