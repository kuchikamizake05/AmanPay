"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileCheck2, LockKeyhole } from "lucide-react";

const stages = ["Created", "Funded", "Delivered", "Settled"] as const;
type Stage = (typeof stages)[number];

const stageCopy: Record<Stage, { title: string; detail: string }> = {
  Created: { title: "Terms agreed", detail: "Both parties approve the same deal terms." },
  Funded: { title: "Funds locked", detail: "Buyer funds sit in Soroban escrow." },
  Delivered: { title: "Delivery submitted", detail: "Seller submits credentials or digital goods." },
  Settled: { title: "Deal settled", detail: "Funds release after buyer approval or timeout." },
};

export function LifecyclePreview() {
  const [stage, setStage] = useState<Stage>("Created");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timeout = window.setTimeout(() => {
      setStage(stages[(stages.indexOf(stage) + 1) % stages.length]);
    }, stage === "Settled" ? 3_000 : 1_900);
    return () => window.clearTimeout(timeout);
  }, [reducedMotion, stage]);

  const currentIndex = reducedMotion ? stages.length - 1 : stages.indexOf(stage);
  const isSettled = currentIndex === stages.length - 1;

  return (
    <div className="lifecycle-preview" aria-label="Escrow lifecycle preview">
      <div className="lifecycle-preview__top">
        <span>AMANPAY / LIVE PREVIEW</span>
        <span className="lifecycle-preview__live"><i /> {isSettled ? "COMPLETE" : "PLAYING"}</span>
      </div>

      <div className="lifecycle-preview__stepper">
        <div className="lifecycle-preview__track" aria-hidden="true">
          <span style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }} />
        </div>
        <div className="lifecycle-preview__stages">
          {stages.map((item, index) => (
            <div className={index <= currentIndex ? "is-active" : ""} key={item}>
              <span>{index < currentIndex ? <CheckCircle2 size={13} /> : index + 1}</span>
              <small>{item}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="lifecycle-preview__state" key={stage}>
        <div className="lifecycle-preview__icon">
          {stage === "Created" && <FileCheck2 size={22} />}
          {stage === "Funded" && <LockKeyhole size={22} />}
          {stage === "Delivered" && <FileCheck2 size={22} />}
          {stage === "Settled" && <CheckCircle2 size={22} />}
        </div>
        <div>
          <p>{stageCopy[stage].title}</p>
          <span>{stageCopy[stage].detail}</span>
        </div>
      </div>

      <div className="lifecycle-preview__amount">
        <span>ESCROW VALUE</span>
        <strong>50.00 USDC</strong>
        <em>{stage === "Settled" ? "Receipt ready to verify" : "Protected by smart contract rules"}</em>
      </div>
    </div>
  );
}
