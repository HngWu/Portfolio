import type {
  SkillTreeData,
  PositionedSkillNode,
  PositionedSkillEdge,
  ComputedSkillTreeLayout,
  SkillStatus,
} from "@/types/skill-tree";

export type {
  SkillTreeData,
  PositionedSkillNode,
  PositionedSkillEdge,
  ComputedSkillTreeLayout,
  SkillStatus,
};

export interface SkillTreeLayoutOptions {
  width?: number;
  tierSpacingY?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

const DEFAULT_OPTIONS: Required<SkillTreeLayoutOptions> = {
  width: 1000,
  tierSpacingY: 160,
  paddingTop: 100,
  paddingBottom: 100,
};

/**
 * Deterministic Y coordinates for celestial astrolabe tiers
 */
export const DETERMINISTIC_TIER_Y: Record<number, number> = {
  1: 100,
  2: 260,
  3: 420,
  4: 580,
  5: 740,
};

/**
 * Calculates radial star radius based on astrolabe node magnitude
 */
export function getNodeRadius(magnitude?: 1 | 2 | 3): number {
  switch (magnitude) {
    case 1:
      return 44; // Anchor star (Core CS, Major Pillars)
    case 2:
      return 36; // Major star
    case 3:
      return 28; // Satellite star
    default:
      return 36;
  }
}

/**
 * Computes deterministic 2D layout coordinates and SVG cubic bezier edge paths
 * for a tiered skill tree graph.
 */
export function computeSkillTreeLayout(
  data: SkillTreeData,
  options?: SkillTreeLayoutOptions
): ComputedSkillTreeLayout {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, tierSpacingY, paddingTop, paddingBottom } = opts;

  // Group nodes by tier
  const tierMap = new Map<number, typeof data.nodes>();
  for (const node of data.nodes) {
    const list = tierMap.get(node.tier) || [];
    list.push(node);
    tierMap.set(node.tier, list);
  }

  const tiers = Array.from(tierMap.keys()).sort((a, b) => a - b);
  const maxTier = tiers.length > 0 ? Math.max(...tiers, 5) : 5;

  const height =
    tiers.length > 0
      ? paddingTop + (maxTier - 1) * tierSpacingY + paddingBottom
      : paddingTop + paddingBottom;

  // Calculate positions per node
  const positionedNodes: PositionedSkillNode[] = [];
  const nodeMap = new Map<string, PositionedSkillNode>();

  for (const tier of tiers) {
    const nodesInTier = tierMap.get(tier) || [];
    const totalInTier = nodesInTier.length;

    nodesInTier.forEach((node, tierIndex) => {
      // Balanced horizontal distribution centered on canvas width
      const x = Math.round((width / (totalInTier + 1)) * (tierIndex + 1));
      const defaultY = DETERMINISTIC_TIER_Y[tier] ?? (paddingTop + (tier - 1) * tierSpacingY);
      const y =
        options?.paddingTop !== undefined || options?.tierSpacingY !== undefined
          ? Math.round(paddingTop + (tier - 1) * tierSpacingY)
          : defaultY;

      const radius = getNodeRadius(node.magnitude);

      const positionedNode: PositionedSkillNode = {
        ...node,
        x,
        y,
        tierIndex,
        totalInTier,
        radius,
      };

      positionedNodes.push(positionedNode);
      nodeMap.set(node.id, positionedNode);
    });
  }

  // Initialize graph adjacency maps
  const parentsMap = new Map<string, string[]>();
  const childrenMap = new Map<string, string[]>();

  for (const node of positionedNodes) {
    parentsMap.set(node.id, []);
    childrenMap.set(node.id, []);
  }

  // Calculate edges with cubic bezier curve paths
  const computedEdges: ComputedSkillTreeLayout["edges"] = [];

  for (const edge of data.edges) {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);

    if (!fromNode || !toNode) {
      continue;
    }

    // Populate adjacency maps
    parentsMap.get(edge.to)?.push(edge.from);
    childrenMap.get(edge.from)?.push(edge.to);

    // Compute cubic bezier path with star radius offsets
    const startRadius = getNodeRadius(fromNode.magnitude);
    const endRadius = getNodeRadius(toNode.magnitude);
    const startX = fromNode.x;
    const startY = fromNode.y + startRadius * 0.75;
    const endX = toNode.x;
    const endY = toNode.y - endRadius * 0.75;
    const deltaY = endY - startY;
    const cp1Y = Math.round(startY + deltaY * 0.5);
    const cp2Y = Math.round(endY - deltaY * 0.5);

    const path = `M ${startX} ${startY} C ${startX} ${cp1Y}, ${endX} ${cp2Y}, ${endX} ${endY}`;

    // Determine edge status based on connected node states
    let status: SkillStatus = "locked";
    if (fromNode.status === "mastered" && toNode.status === "mastered") {
      status = "mastered";
    } else if (fromNode.status === "mastered" && toNode.status === "in-progress") {
      status = "in-progress";
    } else {
      status = "locked";
    }

    computedEdges.push({
      from: edge.from,
      to: edge.to,
      fromNode,
      toNode,
      path,
      status,
    });
  }

  return {
    nodes: positionedNodes,
    nodeMap,
    edges: computedEdges,
    parentsMap,
    childrenMap,
    width,
    height,
  };
}

/**
 * Returns all ancestor node IDs recursively for a given node.
 */
export function getAncestorNodeIds(
  nodeId: string,
  parentsMap: Map<string, string[]>
): Set<string> {
  const ancestors = new Set<string>();
  const queue = [...(parentsMap.get(nodeId) || [])];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!ancestors.has(current)) {
      ancestors.add(current);
      const nextParents = parentsMap.get(current) || [];
      queue.push(...nextParents);
    }
  }

  return ancestors;
}

/**
 * Returns all descendant node IDs recursively for a given node.
 */
export function getDescendantNodeIds(
  nodeId: string,
  childrenMap: Map<string, string[]>
): Set<string> {
  const descendants = new Set<string>();
  const queue = [...(childrenMap.get(nodeId) || [])];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!descendants.has(current)) {
      descendants.add(current);
      const nextChildren = childrenMap.get(current) || [];
      queue.push(...nextChildren);
    }
  }

  return descendants;
}
