"use client"

import * as React from "react"
import { 
  getPageTransitions, 
  savePageTransitions, 
  resetPageTransitionsToDefaults 
} from "@/app/actions/page-transitions"
import { GlassCard } from "@/components/ui/GlassCard"
import { useToastStore } from "@/store/useToastStore"
import { useConfirmStore } from "@/store/useConfirmStore"
import { 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Clock, 
  X,
  Sliders,
  Layers,
  HelpCircle
} from "lucide-react"
import type { PageTransitionRule, TransitionPreset } from "@/types/transitions"

const PRESETS: { id: TransitionPreset; name: string; description: string; tag: string }[] = [
  {
    id: "singularity-bloom",
    name: "Singularity Bloom",
    description: "Default: Derives from the start loading animation. Smooth center radial expand (Quick) or crisp aperture snap (Deep).",
    tag: "DEFAULT",
  },
  {
    id: "arcane-rune",
    name: "Arcane Rune",
    description: "Tailored for /experience. Warm parchment lift (Quick) or dimensional matrix snap (Deep).",
    tag: "ARCANE",
  },
  {
    id: "blueprint-slide",
    name: "Blueprint Slide",
    description: "Tailored for /projects. Fluid lateral pan (Quick) or technical schematic vector slide (Deep).",
    tag: "TECH",
  },
  {
    id: "matrix-pulse",
    name: "Matrix Pulse",
    description: "Tailored for /skills & /transition-lab. Kinetic upward pop (Quick) or digital coordinate snap (Deep).",
    tag: "KINETIC",
  },
  {
    id: "clean-lift",
    name: "Clean Lift",
    description: "Tailored for /cv, /awards, /education. Subtle 8px vertical glide with zero visual clutter.",
    tag: "MINIMAL",
  },
]

export default function TransitionsAdminPage() {
  const { addToast } = useToastStore()
  const { confirm } = useConfirmStore()

  const [rules, setRules] = React.useState<PageTransitionRule[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Modal State for adding new route rule
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [newRoute, setNewRoute] = React.useState("")
  const [newPreset, setNewPreset] = React.useState<TransitionPreset>("singularity-bloom")
  const [newQuickDuration, setNewQuickDuration] = React.useState(260)
  const [newDeepDuration, setNewDeepDuration] = React.useState(220)

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const data = await getPageTransitions()
        if (isMounted) {
          setRules(data)
          setIsLoading(false)
        }
      } catch (e) {
        addToast("Failed to load transition rules: " + (e as Error).message, "error")
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [addToast])

  const handleRuleChange = (
    id: string, 
    field: keyof PageTransitionRule, 
    value: unknown
  ) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await savePageTransitions(rules)
      setHasChanges(false)
      addToast("Page transition rules saved successfully", "success")
    } catch (e) {
      addToast("Failed to save rules: " + (e as Error).message, "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRule = async (id: string, route: string) => {
    if (id === "default" || route === "*") {
      addToast("Cannot delete the default fallback rule", "warning")
      return
    }

    const shouldDelete = await confirm({
      title: "Remove Transition Rule",
      message: `Are you sure you want to remove the transition rule for route "${route}"? This route will fall back to the default Singularity Bloom transition.`,
      confirmText: "Remove Rule",
      cancelText: "Keep Rule",
      isDestructive: true,
    })

    if (shouldDelete) {
      setRules((prev) => prev.filter((r) => r.id !== id))
      setHasChanges(true)
      addToast(`Removed rule for "${route}". Remember to save changes.`, "info")
    }
  }

  const handleResetDefaults = async () => {
    const shouldReset = await confirm({
      title: "Reset to Factory Defaults",
      message: "This will overwrite all customized page transition rules with the recommended project presets. Proceed?",
      confirmText: "Reset Defaults",
      cancelText: "Cancel",
      isDestructive: false,
    })

    if (shouldReset) {
      setIsSaving(true)
      try {
        await resetPageTransitionsToDefaults()
        const refreshed = await getPageTransitions()
        setRules(refreshed)
        setHasChanges(false)
        addToast("Page transitions reset to recommended defaults", "success")
      } catch (e) {
        addToast("Failed to reset: " + (e as Error).message, "error")
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault()
    let cleanRoute = newRoute.trim()
    if (!cleanRoute.startsWith("/") && cleanRoute !== "*") {
      cleanRoute = "/" + cleanRoute
    }

    if (rules.some((r) => r.route === cleanRoute)) {
      addToast(`A transition rule for route "${cleanRoute}" already exists`, "warning")
      return
    }

    const newRule: PageTransitionRule = {
      id: "rule-" + Date.now().toString(36),
      route: cleanRoute,
      preset: newPreset,
      quickDurationMs: Number(newQuickDuration),
      deepDurationMs: Number(newDeepDuration),
      quickEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
      deepEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
      enabled: true,
    }

    setRules((prev) => [...prev, newRule])
    setHasChanges(true)
    setIsAddModalOpen(false)
    setNewRoute("")
    addToast(`Added rule for "${cleanRoute}". Click "Save Changes" to publish.`, "success")
  }

  return (
    <div className="space-y-6 pb-36 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-lume-primary/10 border border-lume-primary/30 flex items-center justify-center text-lume-primary shadow-[0_0_15px_rgba(74,255,180,0.2)]">
              <ArrowLeftRight className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display text-white">Native Page Transitions</h1>
              <p className="text-xs text-white/50">
                Orchestrate native View Transitions API animations across site routes with dual Quick / Deep mode variations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-mono transition-all border border-white/10 active:scale-95 cursor-pointer"
            title="Restore original project defaults"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-mono transition-all border border-white/20 active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus className="size-3.5 text-lume-primary" />
            <span>Add Route</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-lume-primary text-black rounded-xl text-xs font-bold font-mono transition-all shadow-[0_0_20px_rgba(74,255,180,0.3)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none uppercase tracking-wider cursor-pointer"
          >
            <Save className="size-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-400 animate-pulse" />
            <span>You have unsaved changes to your page transition rules.</span>
          </div>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-amber-400 text-black font-bold font-mono rounded-lg text-xs hover:bg-amber-300 transition-colors"
          >
            Save Now
          </button>
        </div>
      )}

      {/* Preset Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {PRESETS.map((p) => (
          <GlassCard key={p.id} className="p-3.5 border-white/5 bg-white/[0.015] rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono font-bold tracking-widest text-lume-primary uppercase px-1.5 py-0.5 rounded bg-lume-primary/10 border border-lume-primary/20">
                  {p.tag}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{p.name}</h4>
              <p className="text-[10px] text-white/50 leading-relaxed">{p.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-white/40 uppercase tracking-wider px-2">
            <span>Configured Route Rules ({rules.length})</span>
            <span>Target Performance: 200–350ms (GPU Transforms Only)</span>
          </div>

          <div className="grid gap-4">
            {rules.map((rule) => {
              const isDefault = rule.route === "*"
              return (
                <GlassCard 
                  key={rule.id} 
                  className={`p-5 sm:p-6 border transition-all duration-300 rounded-3xl ${
                    rule.enabled 
                      ? "bg-white/[0.02] border-white/10 hover:border-white/20" 
                      : "bg-white/[0.005] border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    
                    {/* Route Pattern & Preset Info */}
                    <div className="space-y-2 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-white px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                          {rule.route}
                        </span>
                        {isDefault && (
                          <span className="text-[10px] font-mono text-lume-primary font-bold px-2 py-0.5 rounded bg-lume-primary/15 border border-lume-primary/30">
                            GLOBAL FALLBACK
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          rule.enabled 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}>
                          {rule.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>

                      {/* Preset Selection Dropdown */}
                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-[10px] font-mono uppercase text-white/40">Preset:</label>
                        <select
                          value={rule.preset}
                          onChange={(e) => handleRuleChange(rule.id, "preset", e.target.value)}
                          className="bg-black/60 border border-white/10 text-xs font-mono text-white rounded-xl px-2.5 py-1 focus:border-lume-primary focus:outline-none transition-colors"
                        >
                          {PRESETS.map((p) => (
                            <option key={p.id} value={p.id} className="bg-[#121212] text-white">
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Mode Durations Sliders */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 flex-1 max-w-xl">
                      {/* Quick Pitch Duration Slider */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-amber-300/80 flex items-center gap-1">
                            <Clock className="size-3" /> Quick Mode
                          </span>
                          <span className="text-white font-bold">{rule.quickDurationMs}ms</span>
                        </div>
                        <input
                          type="range"
                          min={150}
                          max={450}
                          step={10}
                          value={rule.quickDurationMs}
                          onChange={(e) => handleRuleChange(rule.id, "quickDurationMs", Number(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-white/30">
                          <span>150ms</span>
                          <span>450ms</span>
                        </div>
                      </div>

                      {/* Deep Dive Duration Slider */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-cyan-300/80 flex items-center gap-1">
                            <Zap className="size-3" /> Deep Mode
                          </span>
                          <span className="text-white font-bold">{rule.deepDurationMs}ms</span>
                        </div>
                        <input
                          type="range"
                          min={150}
                          max={450}
                          step={10}
                          value={rule.deepDurationMs}
                          onChange={(e) => handleRuleChange(rule.id, "deepDurationMs", Number(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-white/30">
                          <span>150ms</span>
                          <span>450ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Toggles & Delete Controls */}
                    <div className="flex items-center justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t border-white/5 lg:border-t-0">
                      {/* Enable / Disable Switch */}
                      <button
                        type="button"
                        onClick={() => handleRuleChange(rule.id, "enabled", !rule.enabled)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                          rule.enabled
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </button>

                      {/* Delete action */}
                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id, rule.route)}
                          className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 cursor-pointer"
                          title={`Delete rule for ${rule.route}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Route Rule Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Plus className="size-4 text-lume-primary" />
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Add Page Transition Rule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                  Target Route Pattern <span className="text-lume-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="/blog, /contact, or /custom-page"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-lume-primary focus:outline-none"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Prefix patterns are supported. For example, <code>/projects</code> automatically covers <code>/projects/*</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                  Transition Preset <span className="text-lume-primary">*</span>
                </label>
                <select
                  value={newPreset}
                  onChange={(e) => setNewPreset(e.target.value as TransitionPreset)}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-lume-primary focus:outline-none"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#121212] text-white">
                      {p.name} ({p.tag})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-amber-300/80 mb-1.5 uppercase">
                    Quick Pitch (ms)
                  </label>
                  <input
                    type="number"
                    min={150}
                    max={450}
                    step={10}
                    value={newQuickDuration}
                    onChange={(e) => setNewQuickDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-lume-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyan-300/80 mb-1.5 uppercase">
                    Deep Dive (ms)
                  </label>
                  <input
                    type="number"
                    min={150}
                    max={450}
                    step={10}
                    value={newDeepDuration}
                    onChange={(e) => setNewDeepDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-lume-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-lume-primary text-black font-mono font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(74,255,180,0.3)]"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
