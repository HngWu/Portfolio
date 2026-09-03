import * as React from "react"
import type { Metadata } from "next"
import { getPortfolioContent } from "@/lib/content/portfolio"
import { CvDossierViewer } from "@/components/cv/CvDossierViewer"
import { VAULT_FOLDERS, applyVaultConfig } from "@/lib/cv/documents"
import { getVaultConfigAction } from "@/app/actions/vault"

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
        <div className="min-h-screen bg-[#050609] text-white/50 flex flex-col items-center justify-center font-mono text-xs gap-3">
          <div className="w-6 h-6 border-2 border-[#4AFFB4]/20 border-t-[#4AFFB4] rounded-full animate-spin" />
          <span>Loading Dossier...</span>
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
