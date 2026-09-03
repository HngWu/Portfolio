"use client"

import * as React from "react"
import {
  Folder,
  FolderOpen,
  FileText,
  ShieldCheck,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Mail,
  Check,
  Github,
  Linkedin,
  Sparkles,
  Trophy,
  Award,
  Star,
} from "lucide-react"
import type { VaultDocument, DocumentFolder } from "@/lib/cv/documents"
import { VAULT_FOLDERS } from "@/lib/cv/documents"
import type { ParsedContact } from "@/lib/content/portfolio"

export interface CvFileExplorerProps {
  documents: VaultDocument[]
  folders?: DocumentFolder[]
  selectedDocId: string
  onSelectDoc: (id: string) => void
  contact?: ParsedContact
}

export function CvFileExplorer({
  documents,
  folders,
  selectedDocId,
  onSelectDoc,
  contact,
}: CvFileExplorerProps) {
  const activeFolders = folders || VAULT_FOLDERS
  const [searchQuery, setSearchQuery] = React.useState("")
  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({
    resume: true,
    hackathons: true,
    scholarships: true,
    honours: true,
    grades: true,
  })
  const [copied, setCopied] = React.useState(false)

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }))
  }

  const handleCopyEmail = () => {
    if (!contact?.email) return
    navigator.clipboard.writeText(contact.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filter documents based on search
  const filteredDocs = React.useMemo(() => {
    if (!searchQuery.trim()) return documents
    const q = searchQuery.toLowerCase().trim()
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q) ||
        d.filename.toLowerCase().includes(q) ||
        d.badge?.toLowerCase().includes(q) ||
        d.format.toLowerCase().includes(q)
    )
  }, [documents, searchQuery])

  const getFolderIcon = (iconType: DocumentFolder["iconType"]) => {
    switch (iconType) {
      case "hackathons":
        return <Trophy className="w-3.5 h-3.5 text-[#4AFFB4]" />
      case "scholarships":
        return <Award className="w-3.5 h-3.5 text-amber-300" />
      case "honours":
        return <Star className="w-3.5 h-3.5 text-cyan-300" />
      case "grades":
        return <ShieldCheck className="w-3.5 h-3.5 text-[#4AFFB4]" />
      case "resume":
      default:
        return <Folder className="w-3.5 h-3.5 text-[#4AFFB4]" />
    }
  }

  const getFormatBadge = (format: VaultDocument["format"]) => {
    switch (format) {
      case "docx":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-[9px] font-mono text-blue-400 font-semibold uppercase tracking-wider">
            DOCX
          </span>
        )
      case "pdf":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[9px] font-mono text-white/70 font-medium uppercase tracking-wider">
            PDF
          </span>
        )
    }
  }

  const getFileIcon = (doc: VaultDocument) => {
    if (doc.id === "resume") {
      return <Sparkles className="w-4 h-4 text-[#4AFFB4] shrink-0" />
    }
    return <FileText className="w-4 h-4 text-white/60 shrink-0" />
  }

  return (
    <aside className="w-full flex flex-col gap-4 text-white">
      {/* File Explorer Container Card */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl p-4 sm:p-5 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4AFFB4]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Explorer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#4AFFB4]/10 border border-[#4AFFB4]/30 text-[#4AFFB4]">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-white tracking-wide">
                Document Vault
              </h2>
              <p className="text-[10px] font-mono text-white/40">Official Records & Credentials</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
            {documents.length} Files
          </span>
        </div>

        {/* Search Filter Input */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credentials, hackathons, awards..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border border-white/10 focus:border-[#4AFFB4]/40 text-xs text-white placeholder-white/30 font-mono transition-all outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* File Tree List */}
        <div className="mt-3.5 flex flex-col gap-3 max-h-[calc(100vh-23rem)] min-h-[360px] overflow-y-auto pr-1.5 custom-scrollbar">
          {searchQuery ? (
            // Flat search results
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-white/40 px-1">
                {filteredDocs.length} matching document{filteredDocs.length === 1 ? "" : "s"}
              </span>
              {filteredDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => onSelectDoc(doc.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 group ${
                      isSelected
                        ? "bg-[#4AFFB4]/10 border-[#4AFFB4]/40 shadow-[0_0_15px_rgba(74,255,180,0.1)]"
                        : "bg-white/[0.01] hover:bg-white/[0.04] border-white/5"
                    }`}
                  >
                    <div className="mt-0.5">{getFileIcon(doc)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected ? "text-[#4AFFB4]" : "text-white/90 group-hover:text-white"
                          }`}
                        >
                          {doc.title}
                        </span>
                        {getFormatBadge(doc.format)}
                      </div>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">{doc.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            // Hierarchical folder tree with granular folders
            activeFolders.map((folder) => {
              const isExpanded = expandedFolders[folder.id]
              return (
                <div key={folder.id} className="flex flex-col">
                  {/* Folder Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03] text-xs font-mono text-white/60 hover:text-white transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                      )}
                      {getFolderIcon(folder.iconType)}
                      <span className="font-medium text-white/80 uppercase tracking-wider text-[11px]">
                        {folder.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">
                      {folder.documents.length}
                    </span>
                  </button>

                  {/* Folder Items */}
                  {isExpanded && (
                    <div className="pl-3 mt-1 flex flex-col gap-1 border-l border-white/10 ml-2.5">
                      {folder.documents.map((doc) => {
                        const isSelected = selectedDocId === doc.id
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => onSelectDoc(doc.id)}
                            className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2 group ${
                              isSelected
                                ? "bg-[#4AFFB4]/10 border-[#4AFFB4]/40 shadow-[0_0_15px_rgba(74,255,180,0.1)]"
                                : "bg-white/[0.01] hover:bg-white/[0.04] border-white/5"
                            }`}
                          >
                            <div className="mt-0.5">{getFileIcon(doc)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span
                                  className={`text-xs font-medium truncate ${
                                    isSelected
                                      ? "text-[#4AFFB4] font-semibold"
                                      : "text-white/85 group-hover:text-white"
                                  }`}
                                >
                                  {doc.title}
                                </span>
                                {getFormatBadge(doc.format)}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-white/40 mt-0.5">
                                <span className="truncate max-w-[150px]">{doc.subtitle}</span>
                                <span className="font-mono shrink-0">{doc.sizeLabel}</span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Direct Connect Quick Action Footer */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-2.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
          Direct Connect
        </span>

        {contact?.email && (
          <button
            type="button"
            onClick={handleCopyEmail}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-white/80 hover:text-white transition-all cursor-pointer group active:scale-[0.99]"
            title="Click to copy email address"
          >
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-[#4AFFB4] shrink-0" />
              <span className="font-mono text-xs truncate">{contact.email}</span>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#4AFFB4] shrink-0">
                <Check className="w-3 h-3" /> Copied
              </span>
            ) : (
              <span className="text-[10px] font-mono text-white/40 group-hover:text-white/70 shrink-0">
                Copy
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-2">
          {contact?.github && (
            <a
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-white/70 hover:text-white transition-all font-mono"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
          {contact?.linkedin && (
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-white/70 hover:text-white transition-all font-mono"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      </div>
    </aside>
  )
}

export default CvFileExplorer
