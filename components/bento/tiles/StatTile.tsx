import { BentoTile } from "../BentoTile"

export function StatTile({ id, size, value, label }: { id: string, size: string, value: string | number, label: string }) {
  return (
    <BentoTile id={id} size={size} className="items-center justify-center text-center">
      <div className="text-4xl md:text-5xl font-mono text-[#4AFFB4] mb-2">{value}</div>
      <div className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase text-white/30">{label}</div>
    </BentoTile>
  )
}
