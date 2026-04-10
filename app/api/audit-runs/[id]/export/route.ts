import { NextRequest, NextResponse } from "next/server";
import { exportAuditCsv, exportAuditJson } from "@/lib/actions";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const format = req.nextUrl.searchParams.get("format") ?? "json";
  if (format === "csv") {
    const csv = await exportAuditCsv(params.id);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=\"audit-${params.id}.csv\"`
      }
    });
  }
  const json = await exportAuditJson(params.id);
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename=\"audit-${params.id}.json\"`
    }
  });
}
