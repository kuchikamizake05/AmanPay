import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  from: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/config/stellar", () => ({
  stellarConfig: { rpcUrl: "https://rpc.example", networkPassphrase: "Test SDF Network ; September 2015" },
}));
vi.mock("@/lib/auth/challenge", () => ({
  buildAuthChallenge: () => ({ toXDR: () => "challenge-xdr" }),
}));
vi.mock("@/lib/supabase/server", () => ({ getSupabaseAdmin: mocks.getSupabaseAdmin }));
vi.mock("@stellar/stellar-sdk", () => ({
  rpc: { Server: class { getAccount = vi.fn().mockRejectedValue(new Error("unfunded")); } },
}));

import { POST } from "./route";

const wallet = `G${"A".repeat(55)}`;

describe("POST /api/auth/challenge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue({ insert: mocks.insert });
    mocks.getSupabaseAdmin.mockReturnValue({ from: mocks.from });
    mocks.insert.mockResolvedValue({ error: null });
  });

  it("rejects malformed wallet before database access", async () => {
    const response = await POST(new Request("http://localhost/api/auth/challenge", {
      method: "POST",
      body: JSON.stringify({ wallet: "invalid" }),
    }));

    expect(response.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("returns generic error when challenge persistence fails", async () => {
    mocks.insert.mockResolvedValue({
      error: { code: "", message: "fetch failed", details: "ENOTFOUND", hint: "" },
    });
    const response = await POST(new Request("http://localhost/api/auth/challenge", {
      method: "POST",
      body: JSON.stringify({ wallet }),
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Gagal menyimpan challenge" });
  });

  it("persists and returns a challenge", async () => {
    const response = await POST(new Request("http://localhost/api/auth/challenge", {
      method: "POST",
      body: JSON.stringify({ wallet }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.from).toHaveBeenCalledWith("auth_challenges");
    await expect(response.json()).resolves.toMatchObject({ challenge: "challenge-xdr" });
  });
});
