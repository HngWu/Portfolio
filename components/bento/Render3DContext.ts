import * as React from "react"

export type Render3DMode = "live" | "template"

export const Render3DContext = React.createContext<Render3DMode>("live")
