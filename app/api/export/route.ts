import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listGroupSummaries, getGroupReport } from "@/lib/server-results";

export async function GET() {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Требуется авторизация администратора." }, { status: 401 });
  }

  const groups = await listGroupSummaries();
  const rows: string[] = [
    [
      "group_code",
      "participant_name",
      "completed",
      "submitted_at",
      "social_anxiety_total",
      "social_anxiety_level",
      "author_profile",
      "liebowitz_conflict_count",
    ].join(","),
  ];

  for (const group of groups) {
    const report = await getGroupReport(group.id);
    if (!report) continue;

    for (const participant of report.participants) {
      rows.push(
        [
          csvEscape(report.group.code),
          csvEscape(participant.displayName),
          participant.hasCompleted ? "yes" : "no",
          csvEscape(participant.submittedAt ?? ""),
          participant.socialAnxietyTotal ?? "",
          csvEscape(participant.socialAnxietyLevel ?? ""),
          csvEscape(participant.authorProfile ?? ""),
          participant.liebowitzConflictCount ?? "",
        ].join(","),
      );
    }
  }

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="social-fears-export.csv"',
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
