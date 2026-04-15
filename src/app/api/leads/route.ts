import { NextResponse } from "next/server";
import { safeParseDiscoveryForm } from "@/lib/discovery-schema";
import { submitLeadToMockService } from "@/lib/server/mock-lead-service";

const RATE_LIMIT_WINDOW_MS = 30_000;
const RATE_LIMIT_MAX = 5;
const ipHits = new Map<string, number[]>();

function cleanRateLimitMap(now: number) {
  for (const [key, hits] of ipHits.entries()) {
    const nextHits = hits.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (nextHits.length === 0) {
      ipHits.delete(key);
      continue;
    }
    ipHits.set(key, nextHits);
  }
}

function allowByRateLimit(ip: string, now: number): boolean {
  cleanRateLimitMap(now);
  const hits = ipHits.get(ip) ?? [];
  if (hits.length >= RATE_LIMIT_MAX) {
    return false;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return true;
}

function getRequestIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  return xff.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  const now = Date.now();
  const ip = getRequestIp(req);
  if (!allowByRateLimit(ip, now)) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { ok: false, message: "Unsupported content type." },
      { status: 415 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof raw !== "object" || raw === null) {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const body = raw as Record<string, unknown>;
  const parsed = safeParseDiscoveryForm({
    name: typeof body.name === "string" ? body.name : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    company: typeof body.company === "string" ? body.company : "",
  });

  if (!parsed.ok) {
    return NextResponse.json({ ok: false, message: parsed.message }, { status: 400 });
  }

  try {
    const submission = await submitLeadToMockService({
      ...parsed.data,
      submittedAt: new Date(now).toISOString(),
      source: "madmonos-discovery-modal",
    });

    return NextResponse.json({ ok: true, leadId: submission.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Lead delivery failed. Please retry." },
      { status: 502 }
    );
  }
}
