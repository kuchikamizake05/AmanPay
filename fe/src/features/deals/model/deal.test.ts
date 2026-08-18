import { describe, expect, it } from "vitest";
import { dealInputSchema, getStatusPresentation } from "./deal";

const validInput = {
  dealType: "Service" as const,
  title: "Landing page toko",
  description: "Tiga section dan mobile responsive",
  seller: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  buyer: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBYXE",
  resolver: "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCDCH",
  asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  amount: "500000",
  deliveryDeadline: "2099-06-30T12:00",
  reviewPeriodHours: 48,
  revisionLimit: 2,
  revisionPeriodHours: 48,
};

describe("deal input", () => {
  it("accepts a complete service deal", () => {
    expect(dealInputSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects equal parties and missing revision period", () => {
    const result = dealInputSchema.safeParse({
      ...validInput,
      buyer: validInput.seller,
      revisionPeriodHours: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Buyer harus berbeda dari seller",
        "Periode revisi wajib diisi",
      ]),
    );
  });
});

describe("deal status presentation", () => {
  it("uses clear English escrow language", () => {
    expect(getStatusPresentation("Created")).toEqual({
      label: "Awaiting Funding",
      tone: "waiting",
      description: "Deal parameters initialized. Waiting for buyer to fund escrow.",
    });
    expect(getStatusPresentation("Released").label).toBe("Funds Released");
  });
});
