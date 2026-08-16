"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { getDetailedItem, updateDetailedItem, DetailedItemRow, DetailedItemUpdate } from "@/app/actions/detailed-items"
import { DetailedItemForm } from "@/components/admin/DetailedItemForm"

export default function EditDetailedItemPage() {
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = React.useState<DetailedItemRow | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true
    async function load() {
      const data = await getDetailedItem(id)
      if (isMounted) {
        setItem(data)
        setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [id])

  const handleSubmit = async (updates: DetailedItemUpdate) => {
    await updateDetailedItem(id, updates)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-20 text-white/50">
        Item not found.
      </div>
    )
  }

  return (
    <DetailedItemForm
      title={`Edit ${item.title}`}
      initialData={item}
      onSubmit={handleSubmit}
    />
  )
}
