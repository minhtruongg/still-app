// app/dashboard/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const personas = await db.persona.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient user={session.user} personas={personas} />;
}
