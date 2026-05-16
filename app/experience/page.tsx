import { DetailShell } from "@/components/detail/DetailShell"

export default function ExperiencePage() {
  return (
    <DetailShell typeLabel="CAREER" title="Experience" descriptor="How I've contributed in professional settings.">
      <div className="pl-6 border-l border-white/10 relative">
        <div className="absolute w-3 h-3 rounded-full bg-[var(--lume-primary)] -left-[6.5px] top-2" />
        <h3 className="text-lg font-medium text-white/90">Software Engineer Intern</h3>
        <p className="text-sm font-mono text-white/40 mt-1">DBS Bank · 2024 - Present</p>
        <ul className="mt-4 text-white/60 text-sm list-disc pl-4 space-y-2">
          <li>Engineered internal dashboard for transaction monitoring.</li>
          <li>Reduced load times by 40% using React Server Components.</li>
        </ul>
      </div>
    </DetailShell>
  )
}
