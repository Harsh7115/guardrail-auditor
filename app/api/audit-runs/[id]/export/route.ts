import { NextRequest, NextResponse } from "next/server";
import { exportAuditCsv, exportAuditJson, exportAuditMarkdown } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const notFound = () => new NextResponse("Audit run not found.", { status: 404 });

  if (format === "csv") {
    const csv = await exportAuditCsv(params.id);
    if (csv == null) return notFound();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=\"audit-${params.id}.csv\"`
      }
    });
  }
  if (format === "md") {
    const markdown = await exportAuditMarkdown(params.id);
    if (markdown == null) return notFound();
    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"audit-${params.id}.md\"`
      }
    });
  }
  const json = await exportAuditJson(params.id);
  if (json == null) return notFound();
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename=\"audit-${params.id}.json\"`
    }
  });
}
