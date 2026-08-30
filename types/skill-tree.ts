export type SkillStatus = "mastered" | "in-progress" | "locked";

export type SkillCategory = "core" | "specialization" | "elective" | "certification";

export interface LinkedProject {
  title: string;
  url: string;
  description: string;
  badge?: string;
  thumbnail?: string;
}

export interface SkillNode {
  id: string;
  label: string;
  tier: number;
  category: SkillCategory;
  status: SkillStatus;
  icon: string;
  description: string;
  skills?: string[];
  linkedProject?: LinkedProject;
}

export interface SkillEdge {
  from: string;
  to: string;
}

export interface SkillCategoryDef {
  id: SkillCategory;
  label: string;
  color: string;
}

export interface SkillTreeData {
  categories: SkillCategoryDef[];
  nodes: SkillNode[];
  edges: SkillEdge[];
}

export interface PositionedSkillNode extends SkillNode {
  x: number;
  y: number;
  tierIndex: number;
  totalInTier: number;
}

export interface PositionedSkillEdge {
  from: string;
  to: string;
  fromNode: PositionedSkillNode;
  toNode: PositionedSkillNode;
  path: string;
  status: SkillStatus;
}

export interface ComputedSkillTreeLayout {
  nodes: PositionedSkillNode[];
  nodeMap: Map<string, PositionedSkillNode>;
  edges: Array<{
    from: string;
    to: string;
    fromNode: PositionedSkillNode;
    toNode: PositionedSkillNode;
    path: string;
    status: SkillStatus;
  }>;
  parentsMap: Map<string, string[]>;
  childrenMap: Map<string, string[]>;
  width: number;
  height: number;
}
