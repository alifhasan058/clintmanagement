import { Project, Activity } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Brand Identity Redesign',
    subtitles: ['Web design', 'Brand Strategy', 'Phase 1'],
    client: 'Client A',
    label: 'Inprogress',
    category: 'Client Work',
    time: 'Active 2h ago',
    rating: 4,
    isStarred: true,
    avatars: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'],
    type: 'standard'
  },
  {
    id: 'proj-2',
    title: 'Corporate Portal Assets',
    subtitles: ['Figma wireframes', 'Design tokens', 'Internal'],
    client: 'All Clients',
    label: 'Planning',
    category: 'Internal',
    time: 'Created yesterday',
    rating: 5,
    isStarred: false,
    avatars: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'],
    type: 'internal'
  },
  {
    id: 'proj-3',
    title: 'Mobile App Design',
    subtitles: ['iOS App', 'Prototypes', 'V1.0'],
    client: 'Client B',
    label: 'Inprogress',
    category: 'External',
    time: 'Active now',
    rating: 5,
    isStarred: true,
    avatars: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'],
    type: 'floating'
  },
  {
    id: 'proj-4',
    title: 'Marketing Campaign Materials',
    subtitles: ['Copywriting', 'Illustrations', 'Launch'],
    client: 'Client C',
    label: 'Completed',
    category: 'External',
    time: 'Completed 3d ago',
    rating: 3,
    isStarred: false,
    avatars: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'],
    type: 'standard'
  },
  {
    id: 'proj-graphic',
    title: 'Team Celebrations Banner',
    subtitles: ['Vector Illustration', 'Corporate Memphis'],
    client: 'All Clients',
    label: 'Neutral',
    category: 'Internal',
    time: '2h ago',
    rating: 5,
    isStarred: false,
    avatars: [],
    type: 'graphic'
  },
  {
    id: 'proj-placeholder',
    title: 'Duplicate Blueprint',
    subtitles: ['Quick Start', 'Editable template'],
    client: 'All Clients',
    label: 'Planning',
    category: 'Internal',
    time: 'Faint template',
    rating: 0,
    isStarred: false,
    avatars: [],
    type: 'empty'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    userName: 'Sullivan',
    userAvatar: '', // Will use the mascot image if empty
    text: 'Completed the wireframes for the Brand Redesign homepage.',
    time: '10 mins ago'
  },
  {
    id: 'act-2',
    userName: 'Jane Foster',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    text: 'Suggested we stop for a quick sync before final handoff.',
    badge: 'Coffee Break',
    time: '1 hour ago'
  },
  {
    id: 'act-3',
    userName: 'Marcus Aurelius',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    text: 'Reviewed and approved the design tokens for the internal design system.',
    time: '3 hours ago'
  }
];
