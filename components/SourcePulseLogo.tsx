import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSatelliteDish } from "@fortawesome/free-solid-svg-icons";

/**
 * Logo = ready-made FontAwesome icon (satellite-dish) + plain wordmark.
 * No custom SVG is drawn. Icon source documented in README.
 * https://fontawesome.com/icons/satellite-dish
 */
export function SourcePulseLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded border border-primary/40 bg-primary/15 text-primary">
        <FontAwesomeIcon icon={faSatelliteDish} className="h-[16px] w-[16px]" />
      </span>
      {!compact && <span className="font-mono text-[15px] font-semibold tracking-tight text-text">SourcePulse</span>}
    </span>
  );
}
