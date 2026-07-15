import { Loader2 } from "lucide-react";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "../ui/utils";

interface PlaceOrderButtonProps {
  disabled?: boolean;
  processing?: boolean;
  idleLabel: string;
  processingLabel: string;
  onPlaceOrder: () => void;
  className?: string;
  children?: ReactNode;
}

export function PlaceOrderButton({
  disabled,
  processing,
  idleLabel,
  processingLabel,
  onPlaceOrder,
  className,
}: PlaceOrderButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || processing) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 650);
    onPlaceOrder();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={cn(
        "agrivo-place-order-btn",
        processing && "agrivo-place-order-btn--processing",
        className,
      )}
      disabled={disabled || processing}
      onClick={handleClick}
      aria-busy={processing || undefined}
    >
      <span className="agrivo-place-order-btn__ripples" aria-hidden="true">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="agrivo-place-order-btn__ripple"
            style={{ left: ripple.x, top: ripple.y }}
          />
        ))}
      </span>
      <span className="agrivo-place-order-btn__content">
        {processing ? (
          <>
            <Loader2 className="agrivo-place-order-btn__spinner h-4 w-4 animate-spin" aria-hidden="true" />
            {processingLabel}
          </>
        ) : (
          idleLabel
        )}
      </span>
    </button>
  );
}
