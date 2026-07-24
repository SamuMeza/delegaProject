import { env } from "@/lib/config/env";

export interface TrackingTokenPayload {
  id: string;
  clientName: string;
  serviceType: string;
  status: string;
  description: string;
  price: number;
  dueDate: string;
  paymentStatus: string;
}

async function sha256(data: string): Promise<string> {
  const enc = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBase64(json: string): string {
  return btoa(json);
}

function fromBase64(token: string): string {
  return atob(token);
}

export async function generateTrackingUrl(payload: TrackingTokenPayload): Promise<string> {
  const serialized = JSON.stringify(payload);
  const signature = await sha256(serialized + env.trackingSalt);
  const token = toBase64(serialized + "." + signature);
  return `/orden/${token}`;
}

export interface DecodedToken {
  payload: TrackingTokenPayload;
  valid: boolean;
}

export async function decodeTrackingToken(token: string): Promise<DecodedToken> {
  try {
    const decoded = fromBase64(token);
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return { payload: null as unknown as TrackingTokenPayload, valid: false };

    const payloadStr = decoded.slice(0, lastDot);
    const signature = decoded.slice(lastDot + 1);
    const payload: TrackingTokenPayload = JSON.parse(payloadStr);

    const expectedSig = await sha256(payloadStr + env.trackingSalt);
    return { payload, valid: signature === expectedSig };
  } catch {
    return { payload: null as unknown as TrackingTokenPayload, valid: false };
  }
}