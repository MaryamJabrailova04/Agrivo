import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const LEAF_PATH =
  "M12 2C12 2 4 8 4 14c0 4.4 3.6 8 8 8s8-3.6 8-8C20 8 12 2 12 2z";

function LeafParticle({
  delay,
  x,
  y,
  size,
  rotate,
}: {
  delay: number;
  x: number;
  y: number;
  size: number;
  rotate: number;
}) {
  return (
    <motion.svg
      className="agrivo-order-success-leaf"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ opacity: 0, scale: 0.4, x, y, rotate: rotate - 20 }}
      animate={{
        opacity: [0, 0.75, 0.4, 0],
        scale: [0.4, 1, 1, 0.85],
        y: [y, y - 12, y - 24, y - 34],
        x: [x, x + 4, x - 3, x + 5],
        rotate: [rotate - 20, rotate, rotate + 12, rotate + 22],
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.22, 1, 0.36, 1],
        repeat: Infinity,
        repeatDelay: 2.4,
      }}
      aria-hidden="true"
    >
      <path d={LEAF_PATH} fill="currentColor" />
      <path d="M12 6v12" stroke="#E8F8EE" strokeWidth="1.2" strokeLinecap="round" />
    </motion.svg>
  );
}

export function SuccessCheckmark({ compact = false }: { compact?: boolean }) {
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSparkle(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const leaves = useMemo(
    () =>
      compact
        ? [
            { delay: 0.7, x: -40, y: -4, size: 11, rotate: -20 },
            { delay: 0.9, x: 36, y: -10, size: 10, rotate: 18 },
            { delay: 1.05, x: -18, y: 28, size: 9, rotate: 10 },
          ]
        : [
            { delay: 0.85, x: -54, y: -8, size: 14, rotate: -25 },
            { delay: 1.0, x: 48, y: -18, size: 12, rotate: 20 },
            { delay: 1.15, x: -36, y: 36, size: 11, rotate: 12 },
            { delay: 1.25, x: 40, y: 30, size: 13, rotate: -8 },
            { delay: 1.35, x: -8, y: -52, size: 10, rotate: 30 },
          ],
    [compact],
  );

  return (
    <div
      className={`agrivo-order-success-hero ${
        compact ? "agrivo-order-success-hero--compact" : ""
      }`}
    >
      <div className="agrivo-order-success-glow" aria-hidden="true" />

      <motion.div
        className="agrivo-order-success-circle-wrap"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="agrivo-order-success-pulse"
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.14, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <motion.div
          className="agrivo-order-success-circle"
          initial={{ scale: 0.55 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.4, 0.64, 1] }}
        >
          <svg className="agrivo-order-success-check" viewBox="0 0 52 52" aria-hidden="true">
            <motion.path
              d="M14.5 27.2 L22.8 35.2 L37.8 17.5"
              fill="none"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          {showSparkle ? (
            <motion.span
              className="agrivo-order-success-sparkle"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.15, 0.85] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              aria-hidden="true"
            />
          ) : null}
        </motion.div>

        <div className="agrivo-order-success-leaves" aria-hidden="true">
          {leaves.map((leaf) => (
            <LeafParticle key={`${leaf.x}-${leaf.delay}`} {...leaf} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
