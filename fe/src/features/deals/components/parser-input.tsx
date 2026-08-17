"use client";

import { useState, useRef } from "react";
import { Sparkles, Loader2, Check, AlertCircle, RefreshCw, ImagePlus, X } from "lucide-react";
import { type ParsedDeal } from "../model/parser";

interface ParserInputProps {
  onApply: (data: ParsedDeal) => void;
}

export function ParserInput({ onApply }: ParserInputProps) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{ base64: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDeal | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    {
      label: "🎨 Jasa Web Design (Service)",
      text: "Bikin landing page 3 section, deadline 5 hari, harga 500 ribu, revisi maksimal 2x, final file dikirim via GitHub.",
    },
    {
      label: "📦 Notion Template (Digital Goods)",
      text: "Aku mau beli template Notion finance tracker harga 150 ribu. Seller kirim link Google Drive setelah aku bayar.",
    },
  ];

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar (PNG, JPG, WebP) yang didukung.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageFile({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleParse(inputText: string) {
    if (!inputText.trim() && !imageFile) return;
    setLoading(true);
    setError(null);
    setParsedData(null);
    setApplied(false);

    try {
      const res = await fetch("/api/deals/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          imageBase64: imageFile?.base64,
          mimeType: imageFile?.mimeType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menganalisis data");
      }

      const result = await res.json();
      if (result.success) {
        setParsedData(result.data);
        setSource(result.source);
      } else {
        throw new Error(result.error || "Gagal menganalisis data");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  function handleFieldChange(field: keyof ParsedDeal, value: any) {
    if (!parsedData) return;
    setParsedData({
      ...parsedData,
      [field]: value,
    });
  }

  function handleApply() {
    if (!parsedData) return;
    onApply(parsedData);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  }

  return (
    <div className="bg-white/40 backdrop-blur-md border border-[#d8d2c3] rounded-xl p-6 shadow-sm mb-8 transition-all hover:shadow-md">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-[#116149]/10 rounded-lg text-[#116149]">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-[#17231e]">AI Deal Autofill</h3>
          <p className="text-xs text-[#667068]">
            Tempel chat atau kesepakatan informal Anda untuk mengisi form secara otomatis.
          </p>
        </div>
      </div>

      {/* Templates */}
      <div className="flex flex-wrap gap-2 mb-4">
        {templates.map((tpl, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setText(tpl.text);
              handleParse(tpl.text);
            }}
            className="text-xs bg-white hover:bg-[#dceadf] text-[#17231e] hover:text-[#116149] border border-[#d8d2c3] px-3 h-8 rounded-full transition-all cursor-pointer flex items-center font-medium"
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {/* Input Textarea & Screenshot Upload */}
      <div className="relative mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Contoh: Bikin logo olshop, budget 200rb, kelar 3 hari, revisi max 3 kali, dikirim lewat email... (atau unggah tangkapan layar chat di bawah)"
          rows={3}
          className="w-full text-sm border border-[#d8d2c3] bg-white/70 p-4 pr-12 rounded-lg outline-none focus:border-[#116149] focus:ring-2 focus:ring-[#116149]/10 text-[#17231e] placeholder:text-[#667068]/60 transition-all resize-none"
        />
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="absolute right-3 top-3 text-[#667068] hover:text-[#17231e] text-xs cursor-pointer"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Image Preview & Upload Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs bg-white hover:bg-neutral-50 text-[#17231e] border border-[#d8d2c3] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-medium shadow-2xs"
        >
          <ImagePlus size={14} className="text-[#116149]" />
          Unggah Screenshot Chat
        </button>

        {imagePreview && (
          <div className="flex items-center gap-2 bg-[#116149]/10 border border-[#116149]/20 px-2.5 py-1 rounded-lg">
            <img src={imagePreview} alt="Chat screenshot" className="w-6 h-6 object-cover rounded" />
            <span className="text-xs text-[#116149] font-medium">Screenshot terpasang</span>
            <button
              type="button"
              onClick={clearImage}
              className="text-[#667068] hover:text-red-500 cursor-pointer ml-1"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center gap-4">
        {error && (
          <div className="flex items-center gap-1.5 text-[#a43b31] text-xs font-semibold">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => handleParse(text)}
          disabled={loading || (!text.trim() && !imageFile)}
          className="button button--primary button--small select-none cursor-pointer flex items-center gap-2 disabled:opacity-55"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menganalisis...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analisis Kesepakatan
            </>
          )}
        </button>
      </div>

      {/* Structured Preview */}
      {parsedData && (
        <div className="mt-6 border-t border-[#d8d2c3]/60 pt-5 animate-rise">
          <div className="flex justify-between items-center mb-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667068] flex items-center gap-1.5">
              Hasil Analisis ({source === "gemini" ? "✨ Gemini AI" : "⚙️ Local Regex"})
            </h4>
            <button
              type="button"
              onClick={() => handleParse(text)}
              className="text-[#116149] hover:text-[#116149]/80 text-xs flex items-center gap-1 cursor-pointer font-medium"
            >
              <RefreshCw size={12} />
              Re-analyze
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50 border border-[#d8d2c3]/50 p-4 rounded-lg text-sm mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#667068]">Tipe Kesepakatan</label>
              <select
                value={parsedData.dealType}
                onChange={(e) => handleFieldChange("dealType", e.target.value)}
                className="bg-white border border-[#d8d2c3] rounded px-2.5 py-1.5 outline-none focus:border-[#116149] text-[#17231e] font-medium"
              >
                <option value="Service">Jasa digital (Service)</option>
                <option value="DigitalGoods">Produk digital (DigitalGoods)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#667068]">Judul Deal</label>
              <input
                type="text"
                value={parsedData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="bg-white border border-[#d8d2c3] rounded px-2.5 py-1.5 outline-none focus:border-[#116149] text-[#17231e] font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#667068]">Nominal (Stroops/Unit)</label>
              <input
                type="number"
                value={parsedData.amount}
                onChange={(e) => handleFieldChange("amount", e.target.value)}
                className="bg-white border border-[#d8d2c3] rounded px-2.5 py-1.5 outline-none focus:border-[#116149] text-[#17231e] font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#667068]">Deadline (Hari)</label>
              <input
                type="number"
                value={parsedData.deadlineDays}
                onChange={(e) => handleFieldChange("deadlineDays", Number(e.target.value))}
                className="bg-white border border-[#d8d2c3] rounded px-2.5 py-1.5 outline-none focus:border-[#116149] text-[#17231e] font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-[#667068]">Deliverables / Media Pengiriman</label>
              <input
                type="text"
                value={parsedData.deliverable}
                onChange={(e) => handleFieldChange("deliverable", e.target.value)}
                className="bg-white border border-[#d8d2c3] rounded px-2.5 py-1.5 outline-none focus:border-[#116149] text-[#17231e] font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
              <label className="text-[11px] font-bold text-[#667068]">Maksimal Revisi</label>
              <input
                type="number"
                value={parsedData.revisionLimit}
                onChange={(e) => handleFieldChange("revisionLimit", Number(e.target.value))}
                className="bg-white border border-[#d8d2c3] rounded px-2.5 py-1.5 outline-none focus:border-[#116149] text-[#17231e] font-medium"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="w-full button button--dark button--small select-none cursor-pointer flex items-center justify-center gap-2 hover:bg-[#116149] transition-colors"
          >
            {applied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                Telah Diterapkan ke Form!
              </>
            ) : (
              <>
                Terapkan ke Form
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
