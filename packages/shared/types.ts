export interface GraphNode {
  id: string;
  label: string;
  name?: string;
  rank?: number;
  x?: number;
  y?: number;
  z?: number;
  fx?: number;
  fy?: number;
  fz?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  weight?: number;
  position3D?: any;
  velocity3D?: any;
  [key: string]: any;
}

export interface GraphLink {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  weight?: number;
  enabled?: boolean;
  [key: string]: any;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}