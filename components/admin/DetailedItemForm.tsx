"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { DetailedItemRow, DetailedItemInsert, DetailedItemUpdate } from "@/app/actions/detailed-items"
import { BasicInfoFields } from "./form/BasicInfoFields"
import { TypePayloadEditor } from "./form/TypePayloadEditor"
import { RawJsonEditor } from "./form/RawJsonEditor"

interface DetailedItemFormProps {
  initialData?: DetailedItemRow
  onSubmit: (data: DetailedItemInsert | DetailedItemUpdate) => Promise<void>
  title: string
}

export function DetailedItemForm({ initialData, onSubmit, title }: DetailedItemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [type, setType] = React.useState<string>(initialData?.type || "project")
  const [customType, setCustomType] = React.useState<string>(
    initialData?.type && !["project", "experience", "education"].includes(initialData.type) ? initialData.type : ""
  )
  const [itemTitle, setItemTitle] = React.useState(initialData?.title || "")
  const [subtitle, setSubtitle] = React.useState(initialData?.subtitle || "")
  const [dateRange, setDateRange] = React.useState(initialData?.date_range || "")
  const [orderVal, setOrderVal] = React.useState(initialData?.order_val ?? 0)

  // Parse JSON payloads safely
  const initialContent = React.useMemo(() => {
    if (!initialData?.content) return {}
    if (typeof initialData.content === "object") return initialData.content as Record<string, any>
    if (typeof initialData.content === "string") {
      try { return JSON.parse(initialData.content) } catch { return {} }
    }
    return {}
  }, [initialData?.content])

  const initialDeepDive = React.useMemo(() => {
    if (!initialData?.deep_dive) return {}
    if (typeof initialData.deep_dive === "object") return initialData.deep_dive as Record<string, any>
    if (typeof initialData.deep_dive === "string") {
      try { return JSON.parse(initialData.deep_dive) } catch { return {} }
    }
    return {}
  }, [initialData?.deep_dive])

  // Raw JSON inputs
  const [rawContent, setRawContent] = React.useState(JSON.stringify(initialContent, null, 2))
  const [rawDeepDive, setRawDeepDive] = React.useState(JSON.stringify(initialDeepDive, null, 2))
  const [showRawJson, setShowRawJson] = React.useState(false)

  // Experience state
  const [expHighlights, setExpHighlights] = React.useState<string[]>(
    Array.isArray(initialContent?.highlights) ? initialContent.highlights : []
  )
  const [expDeepHighlights, setExpDeepHighlights] = React.useState<string[]>(
    Array.isArray(initialDeepDive?.highlights) ? initialDeepDive.highlights : []
  )

  // Education state
  const [eduGpa, setEduGpa] = React.useState(initialContent?.gpa || initialDeepDive?.gpa || "")
  const [eduDegree, setEduDegree] = React.useState(initialDeepDive?.degree || "")
  const [eduInstitution, setEduInstitution] = React.useState(initialDeepDive?.institution || "")
  const [eduHonours, setEduHonours] = React.useState(initialDeepDive?.honours || "")

  // Project state
  const [projTechStack, setProjTechStack] = React.useState<string>(
    Array.isArray(initialContent?.tech_stack)
      ? initialContent.tech_stack.join(", ")
      : Array.isArray(initialContent?.techStack)
      ? initialContent.techStack.join(", ")
      : ""
  )
  const [projGithubUrl, setProjGithubUrl] = React.useState(initialContent?.github_url || initialContent?.githubUrl || "")
  const [projLiveUrl, setProjLiveUrl] = React.useState(initialContent?.live_url || initialContent?.liveUrl || "")
  const [projFeatured, setProjFeatured] = React.useState<boolean>(Boolean(initialContent?.featured))
  const [projNotes, setProjNotes] = React.useState<string>(initialDeepDive?.notes || "")

  const activeType = type === "custom" ? customType : type

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let finalContent: any = {}
      let finalDeepDive: any = {}

      if (showRawJson) {
        finalContent = JSON.parse(rawContent)
        finalDeepDive = JSON.parse(rawDeepDive)
      } else {
        if (activeType === "experience") {
          finalContent = { highlights: expHighlights }
          finalDeepDive = { highlights: expDeepHighlights }
        } else if (activeType === "education") {
          finalContent = { gpa: eduGpa }
          finalDeepDive = { gpa: eduGpa, degree: eduDegree, institution: eduInstitution, honours: eduHonours }
        } else if (activeType === "project") {
          const techArray = projTechStack.split(",").map(s => s.trim()).filter(Boolean)
          finalContent = {
            tech_stack: techArray,
            github_url: projGithubUrl,
            live_url: projLiveUrl,
            featured: projFeatured
          }
          finalDeepDive = { notes: projNotes }
        } else {
          finalContent = JSON.parse(rawContent)
          finalDeepDive = JSON.parse(rawDeepDive)
        }
      }

      await onSubmit({
        type: activeType || "custom",
        title: itemTitle,
        subtitle: subtitle || null,
        date_range: dateRange || null,
        order_val: Number(orderVal),
        content: finalContent,
        deep_dive: finalDeepDive
      })

      router.push("/admin/detailed-items")
    } catch (err: any) {
      setError(err?.message || "Failed to save item. Check JSON formatting if using raw editor.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/detailed-items")}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display text-white/90">{title}</h1>
            <p className="text-sm text-white/50">Manage detailed resume and portfolio database entry.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <BasicInfoFields
          type={type}
          setType={setType}
          customType={customType}
          setCustomType={setCustomType}
          itemTitle={itemTitle}
          setItemTitle={setItemTitle}
          subtitle={subtitle}
          setSubtitle={setSubtitle}
          dateRange={dateRange}
          setDateRange={setDateRange}
          orderVal={orderVal}
          setOrderVal={setOrderVal}
        />

        {!showRawJson && (
          <TypePayloadEditor
            activeType={activeType}
            expHighlights={expHighlights}
            setExpHighlights={setExpHighlights}
            expDeepHighlights={expDeepHighlights}
            setExpDeepHighlights={setExpDeepHighlights}
            eduGpa={eduGpa}
            setEduGpa={setEduGpa}
            eduDegree={eduDegree}
            setEduDegree={setEduDegree}
            eduInstitution={eduInstitution}
            setEduInstitution={setEduInstitution}
            eduHonours={eduHonours}
            setEduHonours={setEduHonours}
            projTechStack={projTechStack}
            setProjTechStack={setProjTechStack}
            projGithubUrl={projGithubUrl}
            setProjGithubUrl={setProjGithubUrl}
            projLiveUrl={projLiveUrl}
            setProjLiveUrl={setProjLiveUrl}
            projFeatured={projFeatured}
            setProjFeatured={setProjFeatured}
            projNotes={projNotes}
            setProjNotes={setProjNotes}
          />
        )}

        <RawJsonEditor
          showRawJson={showRawJson}
          setShowRawJson={setShowRawJson}
          rawContent={rawContent}
          setRawContent={setRawContent}
          rawDeepDive={rawDeepDive}
          setRawDeepDive={setRawDeepDive}
        />

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/detailed-items")}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black font-semibold rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </form>
    </div>
  )
}
