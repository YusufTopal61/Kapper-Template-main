import { motion, useInView } from "motion/react";
import { useRef, type CSSProperties } from "react";

type WordsPullUpProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

/** Splits text into words and animates each one rising + fading in, staggered. */
export function WordsPullUp({ text, className = "", style }: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: "0.4em", opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={{ marginRight: "0.22em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
