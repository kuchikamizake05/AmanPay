import type { DealStatus } from "../model/deal";
import { getStatusPresentation } from "../model/deal";

export function DealStatusBadge({
  status,
  showDescription = false,
}: {
  status: DealStatus;
  showDescription?: boolean;
}) {
  const presentation = getStatusPresentation(status);
  return (
    <div className={`status status--${presentation.tone}`}>
      <span className="status__dot" aria-hidden="true" />
      <div>
        <strong>{presentation.label}</strong>
        {showDescription ? <p>{presentation.description}</p> : null}
      </div>
    </div>
  );
}
