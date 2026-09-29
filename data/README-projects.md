# Projects Metadata Schema (`projects.meta.json`)

This file is the single source of truth for the interactive 3D Projects Showcase.

## Schema Structure

```json
{
  "username": "HngWu",
  "featuredOrder": ["triviaduel", "secure-asset", "lumeglass-portfolio"],
  "projects": [
    {
      "id": "unique-id",
      "slug": "url-friendly-slug",
      "name": "Project Name",
      "repo": "owner/repo-name",
      "status": "Shipped" | "In progress" | "Archived",
      "featured": true | false,
      "language": "TypeScript" | "JavaScript" | "Python" | "C#" | "Kotlin" | "Go",
      "description": "Crisp one-sentence summary for the 3D card.",
      "techStack": ["Next.js 16", "Tailwind CSS v4"],
      "liveUrl": "https://example.com",
      "githubUrl": "https://github.com/owner/repo-name",
      "previewImage": "/images/projects/preview.webp",
      "previewVideo": "/videos/projects/preview.mp4",
      "topics": ["ai", "threejs", "fullstack"],
      "caseStudy": {
        "problem": "Detailed problem description...",
        "approach": "Engineering and architecture methodology...",
        "keyTechnicalDecision": "Key trade-off or architectural choice...",
        "result": "Quantifiable outcomes, metrics, or performance...",
        "whatIdDoDifferently": "Retrospective takeaways...",
        "architectureDiagram": "Optional diagram SVG or markdown..."
      }
    }
  ]
}
```

## How to Add a New Project
1. Open `data/projects.meta.json`.
2. Add a new object into the `"projects"` array.
3. If this project should be highlighted, set `"featured": true` and prepend its `"id"` to the `"featuredOrder"` array.
4. Save the file. The portfolio carousel will automatically load and display the new project, enriching it with live GitHub API metrics.
