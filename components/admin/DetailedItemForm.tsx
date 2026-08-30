"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { DetailedItemRow, DetailedItemInsert, DetailedItemUpdate } from "@/app/actions/detailed-items"
import { BasicInfoFields } from "./form/BasicInfoFields"
import { TypePayloadEditor } from "./form/TypePayloadEditor"
import { RawJsonEditor } from "./form/RawJsonEditor"
import { useToastStore } from "@/store/useToastStore"

interface DetailedItemFormProps {
  initialData?: DetailedItemRow
  onSubmit: (data: DetailedItemInsert | DetailedItemUpdate) => Promise<void>
  title: string
}

export function DetailedItemForm({ initialData, onSubmit, title }: DetailedItemFormProps) {
  const router = useRouter()
  const { addToast } = useToastStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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

  const isCustomType = type === "custom" || !["project", "experience", "education"].includes(type)
  const activeType = isCustomType ? (customType || type) : type

  const getVisualPayloads = React.useCallback(() => {
    let currentContent: any = {}
    let currentDeepDive: any = {}

    if (activeType === "experience") {
      currentContent = { highlights: expHighlights }
      currentDeepDive = { highlights: expDeepHighlights }
    } else if (activeType === "education") {
      currentContent = { gpa: eduGpa }
      currentDeepDive = { gpa: eduGpa, degree: eduDegree, institution: eduInstitution, honours: eduHonours }
    } else if (activeType === "project") {
      const techArray = projTechStack.split(",").map(s => s.trim()).filter(Boolean)
      currentContent = {
        tech_stack: techArray,
        github_url: projGithubUrl,
        live_url: projLiveUrl,
        featured: projFeatured
      }
      currentDeepDive = { notes: projNotes }
    } else {
      try { currentContent = JSON.parse(rawContent) } catch { currentContent = {} }
      try { currentDeepDive = JSON.parse(rawDeepDive) } catch { currentDeepDive = {} }
    }

    return { currentContent, currentDeepDive }
  }, [
    activeType,
    expHighlights,
    expDeepHighlights,
    eduGpa,
    eduDegree,
    eduInstitution,
    eduHonours,
    projTechStack,
    projGithubUrl,
    projLiveUrl,
    projFeatured,
    projNotes,
    rawContent,
    rawDeepDive
  ])

  const handleToggleRawJson = (nextShow: boolean) => {
    if (nextShow) {
      if (["experience", "education", "project"].includes(activeType)) {
        const { currentContent, currentDeepDive } = getVisualPayloads()
        setRawContent(JSON.stringify(currentContent, null, 2))
        setRawDeepDive(JSON.stringify(currentDeepDive, null, 2))
      }
    }
    setShowRawJson(nextShow)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let finalContent: any = {}
      let finalDeepDive: any = {}

      if (showRawJson) {
        finalContent = JSON.parse(rawContent)
        finalDeepDive = JSON.parse(rawDeepDive)
      } else {
        const { currentContent, currentDeepDive } = getVisualPayloads()
        finalContent = currentContent
        finalDeepDive = currentDeepDive
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

      addToast("Entry saved successfully", "success")
      router.push("/admin/detailed-items")
      router.refresh()
    } catch (err: any) {
      addToast(err?.message || "Failed to save entry. Check JSON formatting.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-36 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => router.push("/admin/detailed-items")}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
            title="Back to Detailed Items"
            aria-label="Back to Detailed Items"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-display text-white">{title}</h1>
            <p className="text-xs text-white/50 mt-0.5">Manage detailed resume, education, or project database entry.</p>
          </div>
        </div>
      </div>

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
          setShowRawJson={handleToggleRawJson}
          rawContent={rawContent}
          setRawContent={setRawContent}
          rawDeepDive={rawDeepDive}
          setRawDeepDive={setRawDeepDive}
        />

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/detailed-items")}
            aria-label="Cancel and return to Detailed Items"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label={isSubmitting ? "Saving entry..." : "Save Entry"}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black font-bold rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(74,255,180,0.25)]"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{isSubmitting ? "Saving..." : "Save Entry"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
