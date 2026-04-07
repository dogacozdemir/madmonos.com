export type DiscoveryPayload = {
  bottleneck: "gtm-speed" | "tech-gap" | "creative-scale" | "other";
  bottleneckDetail: string;
  urgency: "asap" | "quarter" | "exploring";
  name: string;
  email: string;
  company: string;
};

const BOTTLENECKS = new Set<DiscoveryPayload["bottleneck"]>([
  "gtm-speed",
  "tech-gap",
  "creative-scale",
  "other",
]);

const URGENCIES = new Set<DiscoveryPayload["urgency"]>(["asap", "quarter", "exploring"]);

/** Basit e-posta kontrolü (bundle’da Zod yok). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function safeParseDiscoveryForm(
  form: DiscoveryPayload
): { ok: true; data: DiscoveryPayload } | { ok: false; message: string } {
  if (!BOTTLENECKS.has(form.bottleneck)) {
    return { ok: false, message: "Invalid bottleneck selection" };
  }
  if (!URGENCIES.has(form.urgency)) {
    return { ok: false, message: "Invalid timeline selection" };
  }

  const bottleneckDetail =
    typeof form.bottleneckDetail === "string" ? form.bottleneckDetail : "";
  if (bottleneckDetail.length > 2500) {
    return { ok: false, message: "Context is too long" };
  }

  const name = typeof form.name === "string" ? form.name.trim() : "";
  if (!name) return { ok: false, message: "Name is required" };
  if (name.length > 120) return { ok: false, message: "Name is too long" };

  const email = typeof form.email === "string" ? form.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, message: "Valid email required" };
  }

  const company = typeof form.company === "string" ? form.company.trim() : "";
  if (company.length > 200) {
    return { ok: false, message: "Company name is too long" };
  }

  return {
    ok: true,
    data: {
      bottleneck: form.bottleneck,
      bottleneckDetail,
      urgency: form.urgency,
      name,
      email,
      company,
    },
  };
}

export const BOTTLENECK_LABELS: Record<DiscoveryPayload["bottleneck"], string> = {
  "gtm-speed": "Go-To-Market speed — launches, cycles, or handoffs stalling revenue",
  "tech-gap": "Tech & MarTech gap — stack fragmentation, data, or integration debt",
  "creative-scale": "Creative & production scale — 4K/AI output cannot keep pace",
  other: "Another bottleneck — we will clarify on follow-up",
};

export const URGENCY_LABELS: Record<DiscoveryPayload["urgency"], string> = {
  asap: "We need momentum in the next few weeks",
  quarter: "This quarter — roadmap-ready",
  exploring: "Exploring — scoping options",
};
