export type DiscoveryPayload = {
  name: string;
  phone: string;
  company: string;
};
/** Telefon alaninda neredeyse tum formatlari kabul et (or. 123, +90..., 533...). */
const PHONE_ACCEPT_RE = /[\d+]/;

export function safeParseDiscoveryForm(
  form: DiscoveryPayload
): { ok: true; data: DiscoveryPayload } | { ok: false; message: string } {
  const name = typeof form.name === "string" ? form.name.trim() : "";
  if (!name) return { ok: false, message: "Name is required" };
  if (name.length > 120) return { ok: false, message: "Name is too long" };

  const phone = typeof form.phone === "string" ? form.phone.trim() : "";
  if (!phone || !PHONE_ACCEPT_RE.test(phone)) {
    return { ok: false, message: "Valid phone number required" };
  }
  if (phone.length > 60) {
    return { ok: false, message: "Phone number is too long" };
  }

  const company = typeof form.company === "string" ? form.company.trim() : "";
  if (!company) return { ok: false, message: "Company is required" };
  if (company.length > 200) {
    return { ok: false, message: "Company name is too long" };
  }

  return {
    ok: true,
    data: {
      name,
      phone,
      company,
    },
  };
}
