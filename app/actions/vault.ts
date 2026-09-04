"use server"

import { revalidatePath } from "next/cache"
import { getTilesByType, updateTile, createTile } from "@/lib/db"
import {
  type VaultConfig,
  getDefaultVaultConfig,
} from "@/lib/cv/documents"

export async function getVaultConfigAction(): Promise<VaultConfig> {
  try {
    const tiles = await getTilesByType("config")
    if (tiles.length === 0) {
      return getDefaultVaultConfig()
    }

    const content = (tiles[0].content || {}) as Record<string, unknown>
    const vaultConfig = content.vault as VaultConfig | undefined

    if (vaultConfig && Array.isArray(vaultConfig.folders) && vaultConfig.folders.length > 0) {
      return vaultConfig
    }

    return getDefaultVaultConfig()
  } catch (err) {
    console.error("Error fetching vault configuration:", err)
    return getDefaultVaultConfig()
  }
}

export async function saveVaultConfigAction(config: VaultConfig): Promise<{ success: boolean; message?: string }> {
  try {
    const tiles = await getTilesByType("config")
    const existing = tiles[0]

    if (existing) {
      const newContent = {
        ...(existing.content as object),
        vault: config,
      } as any
      await updateTile(existing.id, { content: newContent })
    } else {
      await createTile({
        type: "config",
        size: "0x0",
        is_hidden: true,
        content: { vault: config } as any,
      })
    }

    revalidatePath("/cv")
    revalidatePath("/admin/vault")
    return { success: true }
  } catch (err) {
    console.error("Error saving vault configuration:", err)
    return { success: false, message: (err as Error).message }
  }
}

export async function resetVaultConfigAction(): Promise<{ success: boolean }> {
  try {
    const defaultConfig = getDefaultVaultConfig()
    await saveVaultConfigAction(defaultConfig)
    return { success: true }
  } catch (err) {
    console.error("Error resetting vault config:", err)
    return { success: false }
  }
}
