import type {
  SkillTreeData,
  PositionedSkillNode,
  ComputedSkillTreeLayout,
  SkillStatus,
} from "@/types/skill-tree";

export interface SkillTreeLayoutOptions {
  width?: number;
  tierSpacingY?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

const DEFAULT_OPTIONS: Required<SkillTreeLayoutOptions> = {
  width: 1000,
  tierSpacingY: 160,
  paddingTop: 90,
  paddingBottom: 90,
};

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
  const minTier = tiers.length > 0 ? tiers[0] : 1;
  const maxTier = tiers.length > 0 ? tiers[tiers.length - 1] : 1;

  const height =
    tiers.length > 0
      ? paddingTop + (maxTier - minTier) * tierSpacingY + paddingBottom
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
      const y = Math.round(paddingTop + (tier - minTier) * tierSpacingY);

      const positionedNode: PositionedSkillNode = {
        ...node,
        x,
        y,
        tierIndex,
        totalInTier,
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

    // Compute cubic bezier path
    const startX = fromNode.x;
    const startY = fromNode.y;
    const endX = toNode.x;
    const endY = toNode.y;

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
