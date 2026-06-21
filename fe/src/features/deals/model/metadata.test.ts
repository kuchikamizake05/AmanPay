import { describe, expect, it } from "vitest";
import { asCanonicalValue, buildCanonicalTerms } from "./metadata";

describe("canonical deal metadata", () => {
  it("binds readable terms to exact contract values", () => {
    expect(
      buildCanonicalTerms(
        {
          dealType: "DigitalGoods",
          title: "Template Notion",
          description: "Template finance tracker beserta panduan",
          seller: "GSELLER",
          buyer: "GBUYER",
          resolver: "GRESOLVER",
          asset: "CXLM",
          amount: "150000.5",
          deliveryDeadline: "2026-07-01T10:00:00.000Z",
          reviewPeriodHours: 24,
          revisionLimit: 0,
          revisionPeriodHours: 0,
        },
        { contractId: "CESCROW", network: "testnet" },
      ),
    ).toEqual({
      schemaVersion: 1,
      network: "testnet",
      contractId: "CESCROW",
      dealType: "DigitalGoods",
      title: "Template Notion",
      description: "Template finance tracker beserta panduan",
      seller: "GSELLER",
      buyer: "GBUYER",
      resolver: "GRESOLVER",
      asset: "CXLM",
      amountStroops: "1500005000000",
      deliveryDeadline: 1782900000,
      reviewPeriodSeconds: 86400,
      revisionLimit: 0,
      revisionPeriodSeconds: 0,
    });
  });

  it("exposes terms to canonical hashing without mutation", () => {
    const terms = { schemaVersion: 1, title: "Deal" } as never;
    expect(asCanonicalValue(terms)).toBe(terms);
  });
});
