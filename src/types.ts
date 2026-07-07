export type ProjectLabel = 'Inprogress' | 'Completed' | 'Planning' | 'Neutral' | 'Break';
export type ProjectCategory = 'Internal' | 'External' | 'Client Work';

export interface Project {
  id: string;
  title: string;
  subtitles: string[];
  client: string;
  label: ProjectLabel;
  category: ProjectCategory;
  time: string;
  rating: number;
  isStarred: boolean;
  avatars: string[];
  type: 'standard' | 'internal' | 'floating' | 'empty' | 'graphic';
}

export interface Activity {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  badge?: string;
  time: string;
}
