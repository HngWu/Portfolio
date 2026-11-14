import * as THREE from "three"

// Palettes
export const COLOR_GOLD_PRIMARY = new THREE.Color("#F5B041")
export const COLOR_GOLD_ACCENT = new THREE.Color("#FFD166")
export const COLOR_GOLD_GLOW = new THREE.Color("#FFB44A")

export const COLOR_CYAN_PRIMARY = new THREE.Color("#00F0FF")
export const COLOR_CYAN_ACCENT = new THREE.Color("#6AFFFF")
export const COLOR_CYAN_DEEP = new THREE.Color("#0088FF")

export const COLOR_ARMOR_TITANIUM = new THREE.Color("#141824")
export const COLOR_ARMOR_DARK = new THREE.Color("#0b0e17")
export const COLOR_VOID_BLACK = new THREE.Color("#000000")
export const COLOR_ENERGY_CHASSIS = new THREE.Color("#0a0f1d")
export const COLOR_COPPER_CIRCUIT = new THREE.Color("#d97706")
export const COLOR_CHROME_PISTON = new THREE.Color("#d1d5db")
export const COLOR_CARBON_FIBER = new THREE.Color("#111520")

// Global pre-allocated scratch objects for zero-allocation 60fps loops
export const _scratchVec1 = new THREE.Vector3()
export const _scratchVec2 = new THREE.Vector3()
export const _scratchVec3 = new THREE.Vector3()
export const _scratchVec4 = new THREE.Vector3()
export const _scratchVecAssembly1 = new THREE.Vector3()
export const _scratchVecAssembly2 = new THREE.Vector3()
export const _scratchVecAssembly3 = new THREE.Vector3()
export const _scratchVecAssembly4 = new THREE.Vector3()
export const _scratchVecAssembly5 = new THREE.Vector3()

export const _scratchCol1 = new THREE.Color()
export const _scratchCol2 = new THREE.Color()
export const _scratchQuat1 = new THREE.Quaternion()
export const _scratchEuler = new THREE.Euler()
export const _scratchMatrix = new THREE.Matrix4()
