import "server-only";

import type { DiscoveryPayload } from "@/lib/discovery-schema";

export type LeadSubmission = DiscoveryPayload & {
  submittedAt: string;
  source: string;
};

/**
 * Mock integration layer for future CRM/ERP adapter.
 * Set LEAD_MOCK_WEBHOOK_URL to proxy submissions to an external test sink.
 */
export async function submitLeadToMockService(payload: LeadSubmission): Promise<{ id: string }> {
  const webhook = process.env.LEAD_MOCK_WEBHOOK_URL?.trim();
  const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (!webhook) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return { id };
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id, ...payload }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Mock service rejected submission: ${response.status}`);
  }

  return { id };
}
