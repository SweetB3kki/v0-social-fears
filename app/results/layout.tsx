import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Props = {
  children: ReactNode;
};

export default async function ResultsLayout({ children }: Props) {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    redirect("/admin");
  }
  return children;
}
