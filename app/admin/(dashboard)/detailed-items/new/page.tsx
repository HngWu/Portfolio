"use client"

import * as React from "react"
import { createDetailedItem, DetailedItemInsert } from "@/app/actions/detailed-items"
import { DetailedItemForm } from "@/components/admin/DetailedItemForm"

export default function NewDetailedItemPage() {
  const handleSubmit = async (data: any) => {
    await createDetailedItem(data)
  }

  return (
    <DetailedItemForm
      title="Create Detailed Item"
      onSubmit={handleSubmit}
    />
  )
}
