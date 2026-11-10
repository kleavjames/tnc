import { Suspense } from "react";
import { MembershipForm } from "@/components/membership-form";
import { getChurchBranches } from "@/lib/church-branches";

export default function Home() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <RegistrationForm />
    </Suspense>
  );
}

async function RegistrationForm() {
  const branches = await getChurchBranches();
  return <MembershipForm branches={branches} />;
}
