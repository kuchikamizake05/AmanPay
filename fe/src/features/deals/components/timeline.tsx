"use client";

import { ExternalLink } from "lucide-react";

type EventRecord = {
  id: string;
  event_type: string;
  actor: string;
  tx_hash: string;
  resulting_status: string;
  created_at: string;
};

const short = (val: string) => `${val.slice(0, 6)}…${val.slice(-4)}`;

export function Timeline({ events }: { events: EventRecord[] }) {
  if (events.length === 0) {
    return (
      <div className="timeline-empty">
        <p>Belum ada aktivitas tercatat di blockchain untuk deal ini.</p>
      </div>
    );
  }

  const mapType = (type: string) => {
    switch (type) {
      case "fund": return "Buyer mendanai deal";
      case "cancel": return "Seller membatalkan deal";
      case "submit_delivery": return "Seller mengirim hasil pekerjaan";
      case "approve": return "Buyer menyetujui pelepasan dana";
      case "request_revision": return "Buyer meminta revisi pekerjaan";
      case "open_dispute": return "Dispute dibuka";
      case "refund_timeout": return "Refund otomatis karena deadline terlewati";
      case "release_timeout": return "Release otomatis karena review deadline terlewati";
      case "resolve_refund": return "Resolver memutuskan refund ke Buyer";
      case "resolve_release": return "Resolver memutuskan release ke Seller";
      default: return type;
    }
  };

  return (
    <div className="timeline-box">
      <h2>Timeline Aktivitas</h2>
      <div className="timeline-list">
        {events.map((ev) => (
          <div className="timeline-item" key={ev.id}>
            <div className="timeline-item__dot" />
            <div className="timeline-item__content">
              <div className="timeline-item__header">
                <strong>{mapType(ev.event_type)}</strong>
                <span className="timeline-item__time">
                  {new Date(ev.created_at).toLocaleString("id-ID", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <p className="timeline-item__actor">
                Pelaku: <code>{short(ev.actor)}</code>
              </p>
              <div className="timeline-item__meta">
                <span className={`status-badge status-badge--${ev.resulting_status.toLowerCase()}`}>
                  {ev.resulting_status}
                </span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${ev.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="timeline-item__tx-link"
                >
                  Lihat transaksi <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
