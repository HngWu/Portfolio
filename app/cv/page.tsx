import * as React from "react"
import type { Metadata } from "next"
import { getPortfolioContent } from "@/lib/content/portfolio"
import { CvDossierViewer } from "@/components/cv/CvDossierViewer"
import { VAULT_FOLDERS, applyVaultConfig } from "@/lib/cv/documents"
import { getVaultConfigAction } from "@/app/actions/vault"

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPortfolioContent()
  const name = content.hero?.mark || "Curriculum Vitae"
  const role = content.hero?.role || "Software Engineer"

  return {
    title: `CV | ${name} — ${role}`,
    description: `Official Curriculum Vitae and professional dossier for ${name}, ${role}.`,
  }
}

export default async function CvPage() {
  const [portfolio, vaultConfig] = await Promise.all([
    getPortfolioContent(),
    getVaultConfigAction(),
  ])

  const visibleFolders = applyVaultConfig(VAULT_FOLDERS, vaultConfig)
  const visibleDocs = visibleFolders.flatMap((f) => f.documents)

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-transparent text-white/50 flex flex-col items-center justify-center font-mono text-xs gap-3">
          <div className="w-7 h-7 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin shadow-[0_0_20px_rgba(74,255,180,0.2)]" />
          <span className="tracking-widest uppercase text-[11px] text-white/60">Loading Dossier...</span>
        </div>
      }
    >
      <CvDossierViewer
        portfolio={portfolio}
        initialFolders={visibleFolders}
        initialDocuments={visibleDocs}
      />
    </React.Suspense>
  )
}
