import type { Metadata } from "next";
import { MembersView } from "../../../components/members-view";
import { listMembers } from "../../../lib/members";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const [members, pendingMembers] = await Promise.all([
    listMembers("approved"),
    listMembers("pending"),
  ]);
  return (
    <MembersView members={members} pendingCount={pendingMembers.length} />
  );
}
