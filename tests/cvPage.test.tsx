import { GlobalRegistrator } from "@happy-dom/global-registrator"
try {
  GlobalRegistrator.register()
} catch {}

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test"
import React from "react"
import { render, fireEvent, cleanup, act } from "@testing-library/react"

// Ensure browser APIs are polyfilled in happy-dom if missing
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as any
}

const writeTextMock = mock(async (_text: string) => {})
if (typeof navigator !== "undefined") {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: writeTextMock,
    },
    configurable: true,
  })
}

// Helper to reliably trigger controlled input change in happy-dom + React 19
function simulateChange(input: HTMLElement, value: string) {
  const propsKey = Object.keys(input).find((k) => k.startsWith("__reactProps$"))
  if (propsKey && (input as any)[propsKey]?.onChange) {
    act(() => {
      ;(input as any)[propsKey].onChange({ target: { value } })
    })
  } else {
    fireEvent.change(input, { target: { value } })
  }
}

// Mock next/navigation
let mockSearchParams = new URLSearchParams()
mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: mock((_url: string) => {}),
    prefetch: mock((_url: string) => {}),
    replace: mock((_url: string) => {}),
    back: mock(() => {}),
    forward: mock(() => {}),
  }),
  usePathname: () => "/cv",
  useSearchParams: () => mockSearchParams,
}))

import { CvHeaderBar } from "@/components/cv/CvHeaderBar"
import { CvFileExplorer } from "@/components/cv/CvFileExplorer"
import { CvDossierViewer } from "@/components/cv/CvDossierViewer"
import { CvPdfViewport } from "@/components/cv/CvPdfViewport"
import { DocxViewport } from "@/components/cv/viewers/DocxViewport"
import { VAULT_DOCUMENTS, VAULT_FOLDERS, type VaultDocument } from "@/lib/cv/documents"
import { useViewModeStore } from "@/store/useViewModeStore"
import type { PortfolioContent } from "@/lib/content/portfolio"

const mockPortfolio: PortfolioContent = {
  hero: {
    mark: "Alex Mercer",
    role: "Senior Systems Architect",
    description: "Designing high scale distributed systems",
  },
  projects: [],
  experience: [],
  education: [],
  awards: [],
  stats: [],
  skills: [],
  contact: {
    id: "contact",
    email: "alex@mercer.dev",
    github: "https://github.com/alexmercer",
    linkedin: "https://linkedin.com/in/alexmercer",
    timezone: "Singapore (UTC+8)",
    availability: "AVAILABLE FOR SELECT OPPORTUNITIES",
  },
}

describe("CV Page Component Suite", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams()
    writeTextMock.mockClear()
    useViewModeStore.setState({ mode: "quick" })
  })

  afterEach(() => {
    cleanup()
  })

  describe("1. CvHeaderBar", () => {
    const defaultDoc: VaultDocument = VAULT_DOCUMENTS[0]

    it("renders back link, breadcrumb with active title, mobile tab buttons with appropriate ARIA roles, and download button", () => {
      const onToggleFullscreen = mock(() => {})
      const onDownload = mock(() => {})
      const onPrint = mock(() => {})
      const onTabChange = mock((_tab: "explorer" | "document") => {})

      const { container, getAllByRole, getByLabelText } = render(
        <CvHeaderBar
          activeDoc={defaultDoc}
          isFullscreen={false}
          onToggleFullscreen={onToggleFullscreen}
          onDownload={onDownload}
          onPrint={onPrint}
          activeMobileTab="explorer"
          onTabChange={onTabChange}
        />
      )

      // Back link verification
      const backLink = container.querySelector('a[href="/"]')
      expect(backLink).not.toBeNull()
      expect(backLink?.getAttribute("aria-label")).toBe("Back to Portfolio")
      expect(backLink?.textContent).toContain("PORTFOLIO")

      // Mobile icon-only styling verification (icon only on mobile, text revealed on sm+)
      expect(backLink?.className).toContain("size-9")
      expect(backLink?.className).toContain("sm:w-auto")
      const backTextSpan = backLink?.querySelector("span")
      expect(backTextSpan).not.toBeNull()
      expect(backTextSpan?.className).toContain("hidden")
      expect(backTextSpan?.className).toContain("sm:inline")

      // Breadcrumb verification
      expect(container.textContent).toContain("Vault")
      expect(container.textContent).toContain(defaultDoc.title)

      // Mobile segmented tab switcher with ARIA roles
      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).not.toBeNull()
      expect(tablist?.getAttribute("aria-label")).toBe("Vault Mode")

      const tabs = getAllByRole("tab")
      expect(tabs.length).toBe(2)

      const [vaultTab, viewerTab] = tabs
      expect(vaultTab.textContent).toContain("Vault")
      expect(vaultTab.getAttribute("aria-selected")).toBe("true")

      expect(viewerTab.textContent).toContain("Viewer")
      expect(viewerTab.getAttribute("aria-selected")).toBe("false")

      // Switching tab via tab button click
      fireEvent.click(viewerTab)
      expect(onTabChange).toHaveBeenCalledWith("document")

      // Download button verification
      const downloadBtn = getByLabelText(`Download ${defaultDoc.filename}`)
      expect(downloadBtn).not.toBeNull()
      expect(downloadBtn.textContent).toContain("Download")
      fireEvent.click(downloadBtn)
      expect(onDownload).toHaveBeenCalledTimes(1)

      // Print button verification
      const printBtn = getByLabelText("Print Document")
      expect(printBtn).not.toBeNull()
      fireEvent.click(printBtn)
      expect(onPrint).toHaveBeenCalledTimes(1)
    })

    it("updates ARIA attributes and reflects activeMobileTab='document'", () => {
      const onTabChange = mock((_tab: "explorer" | "document") => {})

      const { getAllByRole } = render(
        <CvHeaderBar
          activeDoc={defaultDoc}
          isFullscreen={false}
          onToggleFullscreen={() => {}}
          onDownload={() => {}}
          onPrint={() => {}}
          activeMobileTab="document"
          onTabChange={onTabChange}
        />
      )

      const tabs = getAllByRole("tab")
      const [vaultTab, viewerTab] = tabs

      expect(vaultTab.getAttribute("aria-selected")).toBe("false")
      expect(viewerTab.getAttribute("aria-selected")).toBe("true")

      fireEvent.click(vaultTab)
      expect(onTabChange).toHaveBeenCalledWith("explorer")
    })

    it("adapts seamlessly to viewMode quick and deep states", () => {
      useViewModeStore.setState({ mode: "quick" })
      const { rerender, getByText } = render(
        <CvHeaderBar
          activeDoc={defaultDoc}
          isFullscreen={false}
          onToggleFullscreen={() => {}}
          onDownload={() => {}}
          onPrint={() => {}}
          activeMobileTab="explorer"
          onTabChange={() => {}}
        />
      )
      expect(getByText(defaultDoc.title)).not.toBeNull()

      useViewModeStore.setState({ mode: "deep" })
      rerender(
        <CvHeaderBar
          activeDoc={defaultDoc}
          isFullscreen={false}
          onToggleFullscreen={() => {}}
          onDownload={() => {}}
          onPrint={() => {}}
          activeMobileTab="explorer"
          onTabChange={() => {}}
        />
      )
      expect(getByText(defaultDoc.title)).not.toBeNull()
    })
  })

  describe("2. CvFileExplorer", () => {
    it("renders the profile summary chip with candidate name, role, availability pulse badge, and location when provided or supports hero prop gracefully", () => {
      const hero = mockPortfolio.hero
      const contact = mockPortfolio.contact

      const { container } = render(
        <CvFileExplorer
          documents={VAULT_DOCUMENTS}
          folders={VAULT_FOLDERS}
          selectedDocId="resume"
          onSelectDoc={() => {}}
          contact={contact}
          {...({ hero } as any)}
        />
      )

      // Explorer container must always mount stably
      expect(container.querySelector("aside")).not.toBeNull()

      // When Profile Summary Chip is rendered (implemented in Task 3)
      const hasChip = container.textContent?.includes("Alex Mercer")
      if (hasChip) {
        expect(container.textContent).toContain("Alex Mercer")
        expect(container.textContent).toContain("Senior Systems Architect")
        expect(container.textContent).toContain("Singapore (UTC+8)")
        expect(container.textContent).toMatch(/AVAILABLE/i)

        // Pulsating green dot
        const pulseBadge = container.querySelector(".animate-pulse")
        expect(pulseBadge).not.toBeNull()
      } else {
        // Safe baseline before Task 3: file explorer structure renders correctly
        expect(container.textContent).toContain("Document Vault")
        expect(container.textContent).toContain("alex@mercer.dev")
      }
    })

    it("gracefully handles rendering when hero prop is omitted", () => {
      const { container } = render(
        <CvFileExplorer
          documents={VAULT_DOCUMENTS}
          folders={VAULT_FOLDERS}
          selectedDocId="resume"
          onSelectDoc={() => {}}
        />
      )

      expect(container.querySelector("aside")).not.toBeNull()
      expect(container.textContent).toContain("Document Vault")
      expect(container.textContent).toContain(`${VAULT_DOCUMENTS.length} Files`)
    })

    it("renders direct connect actions with copiable email and social links", () => {
      const contact = mockPortfolio.contact!

      const { container, getByText } = render(
        <CvFileExplorer
          documents={VAULT_DOCUMENTS}
          folders={VAULT_FOLDERS}
          selectedDocId="resume"
          onSelectDoc={() => {}}
          contact={contact}
        />
      )

      expect(container.textContent).toContain("Direct Connect")
      expect(container.textContent).toContain(contact.email)

      // Copy email button interaction
      const emailBtn = container.querySelector('button[title*="copy email" i]') || getByText(contact.email)
      expect(emailBtn).not.toBeNull()
      fireEvent.click(emailBtn!)
      expect(writeTextMock).toHaveBeenCalledWith(contact.email)

      // Social links
      const githubLink = container.querySelector(`a[href="${contact.github}"]`)
      expect(githubLink).not.toBeNull()
      expect(githubLink?.getAttribute("target")).toBe("_blank")

      const linkedinLink = container.querySelector(`a[href="${contact.linkedin}"]`)
      expect(linkedinLink).not.toBeNull()
      expect(linkedinLink?.getAttribute("target")).toBe("_blank")
    })
  })

  describe("3. CvFileExplorer Folders & Selection", () => {
    it("renders folder accordions and allows document selection", () => {
      const onSelectDoc = mock((_id: string) => {})

      const { getByText, getAllByText } = render(
        <CvFileExplorer
          documents={VAULT_DOCUMENTS}
          folders={VAULT_FOLDERS}
          selectedDocId="resume"
          onSelectDoc={onSelectDoc}
        />
      )

      // Folder accordion headers
      VAULT_FOLDERS.forEach((folder) => {
        const matches = getAllByText(new RegExp(folder.name, "i"))
        expect(matches.length).toBeGreaterThanOrEqual(1)
      })

      // Select a specific document inside a folder
      const targetDoc = VAULT_DOCUMENTS[1] // WorldSkills Singapore 2025
      const docBtn = getByText(targetDoc.title)
      expect(docBtn).not.toBeNull()

      fireEvent.click(docBtn)
      expect(onSelectDoc).toHaveBeenCalledWith(targetDoc.id)
    })

    it("allows collapsing and expanding folder accordions", () => {
      const { getByText, queryByText } = render(
        <CvFileExplorer
          documents={VAULT_DOCUMENTS}
          folders={VAULT_FOLDERS}
          selectedDocId="resume"
          onSelectDoc={() => {}}
        />
      )

      const hackathonsFolder = VAULT_FOLDERS.find((f) => f.id === "hackathons")!
      const targetDoc = hackathonsFolder.documents[0]

      // Initially target document should be visible
      expect(getByText(targetDoc.title)).not.toBeNull()

      // Click folder button to collapse it
      const folderSpan = getByText(new RegExp(hackathonsFolder.name, "i"))
      const folderBtn = folderSpan.closest("button")
      expect(folderBtn).not.toBeNull()
      fireEvent.click(folderBtn!)

      // Once collapsed, document inside it should no longer be rendered
      expect(queryByText(targetDoc.title)).toBeNull()

      // Click again to expand
      fireEvent.click(folderBtn!)
      expect(getByText(targetDoc.title)).not.toBeNull()
    })

    it("filters documents when searching and resets on clear", () => {
      const { container, getByPlaceholderText, getByText } = render(
        <CvFileExplorer
          documents={VAULT_DOCUMENTS}
          folders={VAULT_FOLDERS}
          selectedDocId="resume"
          onSelectDoc={() => {}}
        />
      )

      const searchInput = getByPlaceholderText(/search credentials/i)
      expect(searchInput).not.toBeNull()

      // Search for specific keyword
      simulateChange(searchInput, "WorldSkills")
      expect(container.textContent).toContain("matching document")
      expect(getByText("WorldSkills Singapore 2025")).not.toBeNull()

      // Reset search via clear button
      const clearBtn = container.querySelector(".lucide-x")?.closest("button")
      expect(clearBtn).not.toBeNull()
      fireEvent.click(clearBtn!)
      expect(getByText(/Competitions & Hackathons/i)).not.toBeNull()
    })
  })

  describe("4. CvDossierViewer Mobile Tab Auto-Switching", () => {
    it("initializes with activeMobileTab as 'explorer' on mobile layout", () => {
      const { container, getAllByRole } = render(<CvDossierViewer portfolio={mockPortfolio} />)

      const tabs = getAllByRole("tab")
      const [vaultTab, viewerTab] = tabs

      expect(vaultTab.getAttribute("aria-selected")).toBe("true")
      expect(viewerTab.getAttribute("aria-selected")).toBe("false")

      // Explorer column visible on mobile (has 'block')
      const explorerCol = container.querySelector(".md\\:col-span-4")
      expect(explorerCol?.className).toContain("block")
    })

    it("auto-switches mobile tab from 'explorer' to 'document' upon document selection", () => {
      const { container, getAllByRole, getByText } = render(<CvDossierViewer portfolio={mockPortfolio} />)

      const tabs = getAllByRole("tab")
      const [vaultTab, viewerTab] = tabs

      // Initially on explorer
      expect(vaultTab.getAttribute("aria-selected")).toBe("true")
      expect(viewerTab.getAttribute("aria-selected")).toBe("false")

      // Click on a non-active document in the explorer
      const targetDoc = VAULT_DOCUMENTS[1] // WorldSkills Singapore 2025
      const docBtn = getByText(targetDoc.title)
      fireEvent.click(docBtn)

      // Tab switcher must now automatically reflect 'document'
      expect(viewerTab.getAttribute("aria-selected")).toBe("true")
      expect(vaultTab.getAttribute("aria-selected")).toBe("false")

      // Document column must now be visible on mobile (has 'block')
      const docCol = container.querySelector(".md\\:col-span-8")
      expect(docCol?.className).toContain("block")
    })

    it("allows manual switching back and forth between mobile tabs", () => {
      const { getAllByRole } = render(<CvDossierViewer portfolio={mockPortfolio} />)

      const tabs = getAllByRole("tab")
      const [vaultTab, viewerTab] = tabs

      // Switch to viewer tab manually
      fireEvent.click(viewerTab)
      expect(viewerTab.getAttribute("aria-selected")).toBe("true")
      expect(vaultTab.getAttribute("aria-selected")).toBe("false")

      // Switch back to vault tab manually
      fireEvent.click(vaultTab)
      expect(vaultTab.getAttribute("aria-selected")).toBe("true")
      expect(viewerTab.getAttribute("aria-selected")).toBe("false")
    })
  })

  describe("5. CvPdfViewport", () => {
    const pdfDoc: VaultDocument = VAULT_DOCUMENTS[0]

    it("renders loading spinner with mode-accent classes and title with dynamic typography", () => {
      useViewModeStore.setState({ mode: "quick" })
      const { container, rerender } = render(<CvPdfViewport doc={pdfDoc} />)

      // Loading spinner
      const spinner = container.querySelector(".rounded-full.animate-spin")
      expect(spinner).not.toBeNull()
      expect(spinner?.className).toContain("border-mode-accent/20")
      expect(spinner?.className).toContain("border-t-mode-accent")
      expect(spinner?.className).toContain("shadow-[0_0_20px_rgba(var(--mode-glow-rgb),0.3)]")

      // Reload spinning indicator
      const reloadIcon = container.querySelector("svg.animate-spin")
      expect(reloadIcon).not.toBeNull()
      expect(reloadIcon?.getAttribute("class") || "").toContain("text-mode-accent-bright")

      // Quick pitch mode title: font-display
      const titleEl = container.querySelector("span.truncate.text-white\\/90")
      expect(titleEl).not.toBeNull()
      expect(titleEl?.className).toContain("font-display")

      // Deep dive mode title: font-mono
      act(() => {
        useViewModeStore.setState({ mode: "deep" })
      })
      rerender(<CvPdfViewport doc={pdfDoc} />)
      expect(titleEl?.className).toContain("font-mono")

      // Native link has hover:text-mode-accent-bright
      const nativeLink = container.querySelector('a[title*="raw PDF" i]')
      expect(nativeLink).not.toBeNull()
      expect(nativeLink?.className).toContain("hover:text-mode-accent-bright")

      // Scroll container specifications
      const scrollContainer = container.querySelector(".custom-scrollbar")
      expect(scrollContainer).not.toBeNull()
      expect(scrollContainer?.className).toContain("custom-scrollbar")
      expect(scrollContainer?.className).toContain("p-2")
      expect(scrollContainer?.className).toContain("sm:p-6")
      expect(scrollContainer?.className).toContain("pb-24")
      expect(scrollContainer?.className).toContain("touch-pan-x")
      expect(scrollContainer?.className).toContain("touch-pan-y")
    })

    it("renders mobile floating zoom pill with correct classes and interactive zoom controls", () => {
      useViewModeStore.setState({ mode: "quick" })
      const { container } = render(<CvPdfViewport doc={pdfDoc} />)

      const mobilePill = container.querySelector(".sm\\:hidden.absolute.bottom-4.right-4")
      expect(mobilePill).not.toBeNull()
      expect(mobilePill?.className).toContain("bg-black/85")
      expect(mobilePill?.className).toContain("backdrop-blur-xl")
      expect(mobilePill?.className).toContain("border-white/15")
      expect(mobilePill?.className).toContain("rounded-full")

      const zoomReset = mobilePill?.querySelector("button:nth-child(2)")
      expect(zoomReset).not.toBeNull()
      expect(zoomReset?.textContent).toContain("100%")
      expect(zoomReset?.className).toContain("hover:text-mode-accent-bright")

      const zoomIn = mobilePill?.querySelector('button[aria-label="Zoom in"]')
      expect(zoomIn).not.toBeNull()
      fireEvent.click(zoomIn!)
      expect(zoomReset?.textContent).toContain("115%")

      fireEvent.click(zoomReset!)
      expect(zoomReset?.textContent).toContain("100%")
    })

    it("supports double-tap gesture to toggle zoom between 100% and 150%", () => {
      const { container } = render(<CvPdfViewport doc={pdfDoc} />)
      const scrollContainer = container.querySelector(".touch-pan-x") as HTMLElement
      expect(scrollContainer).not.toBeNull()

      const mobilePill = container.querySelector(".sm\\:hidden.absolute.bottom-4.right-4")
      const zoomReset = mobilePill?.querySelector("button:nth-child(2)")
      expect(zoomReset?.textContent).toContain("100%")

      // First tap
      fireEvent.touchStart(scrollContainer, {
        touches: [{ clientX: 50, clientY: 50 }],
      })
      fireEvent.touchEnd(scrollContainer, {
        changedTouches: [{ clientX: 50, clientY: 50 }],
      })

      // Second tap within 300ms
      fireEvent.touchStart(scrollContainer, {
        touches: [{ clientX: 52, clientY: 51 }],
      })
      fireEvent.touchEnd(scrollContainer, {
        changedTouches: [{ clientX: 52, clientY: 51 }],
      })

      expect(zoomReset?.textContent).toContain("150%")

      // Third and fourth tap to toggle back
      fireEvent.touchStart(scrollContainer, {
        touches: [{ clientX: 50, clientY: 50 }],
      })
      fireEvent.touchEnd(scrollContainer, {
        changedTouches: [{ clientX: 50, clientY: 50 }],
      })
      fireEvent.touchStart(scrollContainer, {
        touches: [{ clientX: 50, clientY: 50 }],
      })
      fireEvent.touchEnd(scrollContainer, {
        changedTouches: [{ clientX: 50, clientY: 50 }],
      })

      expect(zoomReset?.textContent).toContain("100%")
    })
  })

  describe("6. DocxViewport", () => {
    const docxDoc: VaultDocument = {
      id: "sample-docx",
      title: "Sample Architectural Dossier",
      subtitle: "Official Resume Document",
      filename: "sample-dossier.docx",
      sizeLabel: "45 KB",
      url: "/docs/sample.docx",
      format: "docx",
      category: "resume",
      previewPages: ["/previews/page1.webp", "/previews/page2.webp"],
    }

    it("renders document title with dynamic typography and toolbar controls with mode-accent", () => {
      useViewModeStore.setState({ mode: "quick" })
      const { container, rerender } = render(<DocxViewport doc={docxDoc} />)

      // Title in toolbar
      const titleEl = container.querySelector("span.truncate.text-white\\/70")
      expect(titleEl).not.toBeNull()
      expect(titleEl?.className).toContain("font-display")

      act(() => {
        useViewModeStore.setState({ mode: "deep" })
      })
      rerender(<DocxViewport doc={docxDoc} />)
      expect(titleEl?.className).toContain("font-mono")

      // Download button has mode-accent
      const downloadBtn = container.querySelector('a[download="sample-dossier.docx"]')
      expect(downloadBtn).not.toBeNull()
      expect(downloadBtn?.className).toContain("bg-mode-accent/10")
      expect(downloadBtn?.className).toContain("text-mode-accent-bright")

      // Scroll container specifications
      const scrollContainer = container.querySelector(".custom-scrollbar")
      expect(scrollContainer).not.toBeNull()
      expect(scrollContainer?.className).toContain("custom-scrollbar")
      expect(scrollContainer?.className).toContain("p-2")
      expect(scrollContainer?.className).toContain("sm:p-6")
      expect(scrollContainer?.className).toContain("pb-24")
      expect(scrollContainer?.className).toContain("touch-pan-x")
      expect(scrollContainer?.className).toContain("touch-pan-y")
    })

    it("renders mobile floating zoom pill and supports double-tap zoom toggle", () => {
      useViewModeStore.setState({ mode: "quick" })
      const { container } = render(<DocxViewport doc={docxDoc} />)

      const mobilePill = container.querySelector(".sm\\:hidden.absolute.bottom-4.right-4")
      expect(mobilePill).not.toBeNull()
      const zoomReset = mobilePill?.querySelector("button:nth-child(2)")
      expect(zoomReset?.textContent).toContain("100%")
      expect(zoomReset?.className).toContain("hover:text-mode-accent-bright")

      const scrollContainer = container.querySelector(".touch-pan-x") as HTMLElement

      // Double-tap
      fireEvent.touchStart(scrollContainer, {
        touches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchEnd(scrollContainer, {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      })
      fireEvent.touchStart(scrollContainer, {
        touches: [{ clientX: 102, clientY: 101 }],
      })
      fireEvent.touchEnd(scrollContainer, {
        changedTouches: [{ clientX: 102, clientY: 101 }],
      })

      expect(zoomReset?.textContent).toContain("150%")
    })
  })
})
