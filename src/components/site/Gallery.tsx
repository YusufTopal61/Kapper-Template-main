import { motion } from "motion/react";

const tiles = [
  { label: "Fade", block: "block-ink", span: "sm:col-span-2 sm:row-span-2" },
  { label: "Baardlijn", block: "block-mid", span: "" },
  { label: "Crop", block: "block-fog", span: "" },
  { label: "Scheerbeurt", block: "block-fog", span: "" },
  { label: "Styling", block: "block-ink", span: "" },
  { label: "Interieur", block: "block-mid", span: "sm:col-span-2" },
  { label: "Detail", block: "block-fog", span: "" },
  { label: "Werkplek", block: "block-ink", span: "" },
];

export function Gallery({ limit }: { limit?: number }) {
  const items = limit ? tiles.slice(0, limit) : tiles;

  return (
    <div className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[180px] sm:grid-cols-4">
      {items.map((tile, i) => (
        <motion.figure
          key={tile.label}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          className={`group relative overflow-hidden rounded-lg border border-border ${tile.span}`}
        >
          <div
            className={`size-full ${tile.block} transition-transform duration-[600ms] ease-out group-hover:scale-110`}
          />
          <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-background opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 mix-blend-difference">
            {tile.label}
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}
