export type ParsedDeal = {
  dealType: "Service" | "DigitalGoods";
  title: string;
  amount: string;
  deadlineDays: number;
  deliverable: string;
  revisionLimit: number;
};

export function parseTextWithRegex(text: string): ParsedDeal {
  const lowercase = text.toLowerCase();

  // 1. Detect Deal Type
  // Digital goods keywords
  const digitalKeywords = [
    "notion",
    "tracker",
    "template",
    "ebook",
    "lisensi",
    "download",
    "akun",
    "pdf",
    "zip",
  ];
  const isDigital = digitalKeywords.some((kw) => lowercase.includes(kw));
  const dealType = isDigital ? "DigitalGoods" : "Service";

  // 2. Extract Amount
  let amount = "0";
  // Match "150 ribu", "500k", "500.000", "500000", "150rb", "1 juta", "1jt"
  const amountRegex = /(\d+(?:\.\d+)?)\s*(ribu|rb|k|jt|juta|xlm|usdc|rupiah)?\b/gi;
  let match;
  let maxAmount = 0;

  while ((match = amountRegex.exec(lowercase)) !== null) {
    let val = parseFloat(match[1].replace(/\./g, ""));
    const unit = match[2]?.toLowerCase();

    if (unit === "ribu" || unit === "rb" || unit === "k") {
      val *= 1_000;
    } else if (unit === "jt" || unit === "juta") {
      val *= 1_000_000;
    }

    if (val > maxAmount) {
      maxAmount = val;
    }
  }

  if (maxAmount > 0) {
    amount = String(maxAmount);
  } else {
    // If no unit matches, try a simple number match that is large enough or fallback
    const simpleNumRegex = /\b(\d{3,})\b/g;
    let simpleMatch;
    while ((simpleMatch = simpleNumRegex.exec(lowercase)) !== null) {
      const val = parseInt(simpleMatch[1], 10);
      if (val > maxAmount) {
        maxAmount = val;
      }
    }
    if (maxAmount > 0) amount = String(maxAmount);
  }

  // If still 0, default based on common templates
  if (amount === "0") {
    amount = isDigital ? "150000" : "500000";
  }

  // 3. Extract Revision Limit
  let revisionLimit = 0;
  let revAltMatch = null;
  const revisionRegex = /(?:revisi|revisian)\s*(?:maksimal|maks|max)?\s*(\d+)\s*(?:x|kali)?/i;
  const revMatch = text.match(revisionRegex);
  if (revMatch) {
    revisionLimit = parseInt(revMatch[1], 10);
  } else {
    const revAltRegex = /(\d+)\s*(?:x|kali)\s*(?:revisi|revisian)/i;
    revAltMatch = text.match(revAltRegex);
    if (revAltMatch) {
      revisionLimit = parseInt(revAltMatch[1], 10);
    }
  }
  // Default for services is 2 if not found, 0 for digital goods
  if (!revMatch && !revAltMatch && dealType === "Service") {
    revisionLimit = 2;
  }

  // 4. Extract Deadline (Days)
  let deadlineDays = 3; // Default 3 days
  const dayMatch = lowercase.match(/(\d+)\s*(?:hari|day)/i);
  if (dayMatch) {
    deadlineDays = parseInt(dayMatch[1], 10);
  } else if (lowercase.includes("jumat") || lowercase.includes("friday")) {
    const today = new Date().getDay(); // 0 is Sunday, 5 is Friday
    const daysUntilFriday = (5 - today + 7) % 7 || 7;
    deadlineDays = daysUntilFriday;
  } else if (lowercase.includes("besok") || lowercase.includes("tomorrow")) {
    deadlineDays = 1;
  }

  // 5. Extract Deliverable / Media
  let deliverable = isDigital ? "Link Google Drive / Download" : "Final file / Link Github";
  if (lowercase.includes("google drive") || lowercase.includes("gdrive")) {
    deliverable = "Link Google Drive";
  } else if (lowercase.includes("github") || lowercase.includes("git ")) {
    deliverable = "GitHub Repository";
  } else {
    const deliverableRegex = /(?:kirim|lewat|via|melalui|situs)\s*([a-z0-9\s]{3,30})(?:\.|\b)/i;
    const delivMatch = text.match(deliverableRegex);
    if (delivMatch && delivMatch[1].trim().length > 3) {
      deliverable = delivMatch[1].trim();
    }
  }

  // 6. Extract Title
  let titleText = text.trim();
  // Strip initial fillers case-insensitively
  const fillers = [
    /^(?:aku\s+mau\s+)?(?:beli|bikin|buat|pesan|jasa)\s+/i,
    /^(?:saya\s+mau\s+)?(?:beli|bikin|buat|pesan|jasa)\s+/i,
  ];
  for (const filler of fillers) {
    titleText = titleText.replace(filler, "");
  }

  // Split by typical metadata keywords or punctuation
  const splitRegex = /\b(?:harga|deadline|revisi|via|dengan|sebesar|kirim|dikirim|lewat|melalui|seller|buyer)\b|[,.\-]/i;
  const parts = titleText.split(splitRegex);
  let title = parts[0].trim();

  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = isDigital ? "Pembelian Produk Digital" : "Jasa Pengerjaan";
  }

  return {
    dealType,
    title,
    amount,
    deadlineDays,
    deliverable,
    revisionLimit,
  };
}
