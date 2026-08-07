export interface NavNode {
  label: string;
  icon?: string;
  link?: string;
  isDivider?: boolean;
  children?: NavNode[];
}

export type NavLayout = 'sidebar' | 'horizontal';
