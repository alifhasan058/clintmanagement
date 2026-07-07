import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Headphones, 
  Bell, 
  Grid as GridIcon, 
  List as ListIcon, 
  Plus, 
  Star, 
  MoreHorizontal, 
  MoreVertical, 
  FileText, 
  FolderOpen, 
  FileCode, 
  Smile, 
  Send, 
  MessageSquare, 
  Settings, 
  Layers, 
  X, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Copy,
  FolderPlus
} from 'lucide-react';
import { Project, Activity, ProjectLabel, ProjectCategory } from './types';
import { INITIAL_PROJECTS, INITIAL_ACTIVITIES } from './initialData';

// Resolve generated image assets cleanly at build-time using standard Vite URLs
const mascotAvatar = new URL('./assets/images/mascot_avatar_1783354640443.jpg', import.meta.url).href;
const celebrationJumping = new URL('./assets/images/celebration_jumping_1783354655245.jpg', import.meta.url).href;

export default function App() {
  // App State
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Real-time Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('All Clients');
  const [selectedLabel, setSelectedLabel] = useState<string>('Inprogress');
  const [selectedCategory, setSelectedCategory] = useState<string>('Internal');
  const [sortOption, setSortOption] = useState<string>('By Activity');
  
  // Sidebar custom active tab
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  // Input Box Chat message
  const [messageInput, setMessageInput] = useState('');
  
  // Modal State for adding new projects
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State for new project
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('Client A');
  const [newLabel, setNewLabel] = useState<ProjectLabel>('Inprogress');
  const [newCategory, setNewCategory] = useState<ProjectCategory>('Internal');
  const [newSubtitles, setNewSubtitles] = useState('');
  const [newRating, setNewRating] = useState(4);

  // Active filter stat shortcut
  const [statFilter, setStatFilter] = useState<string | null>(null);

  // UI Interactive Dropdowns toggles
  const [dropdownOpen, setDropdownOpen] = useState<'client' | 'label' | 'category' | 'sort' | null>(null);

  // Ref for auto-scrolling activity feed
  const activityEndRef = useRef<HTMLDivElement>(null);

  // Notifications or toast message
  const [toast, setToast] = useState<string | null>(null);

  // Predefined avatar selections for creating projects
  const preSelectedAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
  ];

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Scroll to bottom of activity feed when new message added
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleOutsideClick = () => setDropdownOpen(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter and Sort Projects dynamically
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter by active view (Projects vs Templates)
    if (activeTab === 'templates') {
      result = result.filter(p => p.type === 'empty' || p.type === 'graphic');
    } else {
      result = result.filter(p => p.type !== 'empty');
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.client.toLowerCase().includes(q) ||
        p.subtitles.some(s => s.toLowerCase().includes(q))
      );
    }

    // Filter by dropdown: Client
    if (selectedClient !== 'All Clients') {
      result = result.filter(p => p.client === selectedClient);
    }

    // Filter by dropdown: Label
    if (selectedLabel !== 'All Labels') {
      result = result.filter(p => p.label === selectedLabel);
    }

    // Filter by dropdown: Category
    if (selectedCategory !== 'All Categories') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Dynamic stat filter shortcut
    if (statFilter === 'total') {
      // no extra filter
    } else if (statFilter === 'completed') {
      result = result.filter(p => p.label === 'Completed');
    } else if (statFilter === 'inprogress') {
      result = result.filter(p => p.label === 'Inprogress');
    } else if (statFilter === 'outofschedule') {
      result = result.filter(p => p.label === 'Planning' || p.label === 'Neutral' || p.label === 'Break');
    }

    // Sort options
    if (sortOption === 'By Rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'By Name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // By Activity (Default) - Standard sorting (star rating, then active status)
      result.sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0));
    }

    return result;
  }, [projects, activeTab, searchQuery, selectedClient, selectedLabel, selectedCategory, sortOption, statFilter]);

  // Compute stats dynamically for the 2x2 grid
  const stats = useMemo(() => {
    const total = projects.filter(p => p.type !== 'empty').length;
    const completed = projects.filter(p => p.label === 'Completed').length;
    const inProgress = projects.filter(p => p.label === 'Inprogress').length;
    // Out of schedule: projects with planning, neutral or other labels
    const outOfSchedule = projects.filter(p => p.label === 'Planning' || p.label === 'Neutral' || p.label === 'Break').length;

    return { total, completed, inProgress, outOfSchedule };
  }, [projects]);

  // Toggle Project Star Rating
  const toggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isStarred: !p.isStarred } : p));
    const project = projects.find(p => p.id === id);
    if (project) {
      triggerToast(project.isStarred ? `Removed ${project.title} from favorites` : `Starred ${project.title}! ⭐`);
    }
  };

  // Change Rating Stars
  const setProjectRating = (id: string, rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, rating } : p));
    triggerToast(`Rating updated!`);
  };

  // Duplicate project (Make a copy)
  const duplicateProject = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newProj: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      title: `${project.title} (Copy)`,
      time: 'Active now',
      isStarred: false
    };
    setProjects(prev => {
      // Find index of standard list to insert nicely
      return [newProj, ...prev];
    });
    
    // Add activity
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      userName: 'Sullivan',
      userAvatar: '',
      text: `Duplicated and created a new copy of "${project.title}".`,
      time: 'Just now'
    };
    setActivities(prev => [...prev, newAct]);
    triggerToast(`Created copy of ${project.title}! 📋`);
  };

  // Delete project
  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = projects.find(p => p.id === id);
    if (!project) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    triggerToast(`Deleted project: ${project.title}`);
  };

  // Submit chat message to Activity Feed
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() === '') return;

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      userName: 'Sullivan',
      userAvatar: mascotAvatar,
      text: messageInput.trim(),
      time: 'Just now'
    };

    setActivities(prev => [...prev, newAct]);
    setMessageInput('');
    triggerToast(`Message posted!`);
  };

  // Preset Message options for quick testing
  const sendQuickMessage = (text: string, badge?: string) => {
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      userName: 'Sullivan',
      userAvatar: mascotAvatar,
      text,
      badge,
      time: 'Just now'
    };
    setActivities(prev => [...prev, newAct]);
    triggerToast(`Posted status update`);
  };

  // Submit standard project form
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() === '') {
      triggerToast('Please enter a project title');
      return;
    }

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      subtitles: newSubtitles ? newSubtitles.split(',').map(s => s.trim()) : ['Creative Design', 'Responsive', 'Internal'],
      client: newClient,
      label: newLabel,
      category: newCategory,
      time: 'Active now',
      rating: newRating,
      isStarred: false,
      avatars: [
        preSelectedAvatars[Math.floor(Math.random() * preSelectedAvatars.length)],
        preSelectedAvatars[Math.floor(Math.random() * preSelectedAvatars.length)]
      ],
      type: 'standard'
    };

    setProjects(prev => [newProj, ...prev]);
    
    // Add activity feed
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      userName: 'Sullivan',
      userAvatar: mascotAvatar,
      text: `Started a brand new project: "${newProj.title}" for ${newProj.client}.`,
      time: 'Just now'
    };
    setActivities(prev => [...prev, newAct]);

    setIsModalOpen(false);
    // Clear form
    setNewTitle('');
    setNewSubtitles('');
    setNewRating(4);
    triggerToast(`Started project: ${newProj.title}! 🚀`);
  };

  return (
    <div id="app_viewport" className="min-h-screen w-full bg-[#7358B7] p-3 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      
      {/* Toast Alert popup */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            id="toast-notification"
            className="fixed top-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700/50"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#2AB4B3] animate-pulse" />
            <span className="text-sm font-medium">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div 
        id="main_container" 
        className="bg-white w-full max-w-7xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[85vh] border border-slate-100/10"
      >
        
        {/* LEFT SIDEBAR (Narrow vertical navigation pane) */}
        <aside 
          id="left_sidebar" 
          className="bg-white border-b lg:border-b-0 lg:border-r border-slate-100 flex lg:flex-col justify-between items-center p-4 lg:py-8 lg:px-4 lg:w-[80px]"
        >
          {/* Logo Brand Mark */}
          <div className="flex items-center gap-2 lg:flex-col lg:gap-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7358B7] to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
              <div className="w-4 h-4 rounded bg-white transform rotate-45" />
            </div>
            <span className="lg:hidden font-extrabold text-slate-800 tracking-tight text-lg">Mosaik</span>
          </div>

          {/* Navigation Menu Icons */}
          <nav className="flex lg:flex-col gap-1 sm:gap-2">
            {[
              { id: 'dashboard', icon: GridIcon, label: 'Board' },
              { id: 'templates', icon: Layers, label: 'Templates' },
              { id: 'messages', icon: MessageSquare, label: 'Inbox' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    setActiveNav(item.id);
                    if (item.id === 'templates') {
                      setActiveTab('templates');
                      triggerToast('Viewing Project Templates');
                    } else if (item.id === 'dashboard') {
                      setActiveTab('projects');
                      triggerToast('Viewing Main Project Workspace');
                    } else {
                      triggerToast(`Switched to ${item.label}`);
                    }
                  }}
                  title={item.label}
                  className={`relative p-3 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-slate-100 text-[#7358B7]' 
                      : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {/* Subtle active state line */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#7358B7] rounded-r-full hidden lg:block" />
                  )}
                  {/* Hover tooltip */}
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden lg:block whitespace-nowrap z-30">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Minimal info icon or quick status info */}
          <div className="hidden lg:flex flex-col items-center gap-4">
            <button 
              onClick={() => triggerToast("Sullivan's workspace is online")}
              className="p-3 text-emerald-500 bg-emerald-50 rounded-full animate-pulse hover:bg-emerald-100"
              title="Workspace Online Status"
            >
              <span className="block w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          </div>
        </aside>

        {/* CENTER MAIN CONTENT PANEL (Soft gray container) */}
        <main 
          id="center_main_content" 
          className="bg-slate-50 lg:rounded-[24px] lg:m-3 p-4 sm:p-6 flex-1 flex flex-col overflow-y-auto"
        >
          {/* TOP HEADER AREA */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Tab Selector: Projects / Templates */}
              <button 
                id="tab-projects"
                onClick={() => {
                  setActiveTab('projects');
                  setActiveNav('dashboard');
                }}
                className={`text-2xl font-black transition-all ${
                  activeTab === 'projects' 
                    ? 'text-slate-950 border-b-2 border-slate-900' 
                    : 'text-slate-400 hover:text-slate-700 font-medium'
                }`}
              >
                Projects
              </button>
              <button 
                id="tab-templates"
                onClick={() => {
                  setActiveTab('templates');
                  setActiveNav('templates');
                }}
                className={`text-2xl font-black transition-all ${
                  activeTab === 'templates' 
                    ? 'text-slate-950 border-b-2 border-slate-900' 
                    : 'text-slate-400 hover:text-slate-700 font-medium'
                }`}
              >
                Templates
              </button>
            </div>

            {/* Action & Utilities */}
            <div className="flex items-center gap-3">
              {/* Pill-shaped teal button with glow drop shadow */}
              <button
                id="btn-start-project"
                onClick={() => setIsModalOpen(true)}
                className="bg-[#2AB4B3] hover:bg-[#239c9b] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-[0_4px_16px_rgba(42,180,179,0.45)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Start a new project
              </button>

              {/* Minimal Line Utilities icons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById('project-search-input');
                    el?.focus();
                    triggerToast("Type in the search field to filter in real-time");
                  }}
                  className="w-10 h-10 rounded-full border border-slate-200/60 flex items-center justify-center bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Search Workspace"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => triggerToast("Opening Live Support Chat...")}
                  className="w-10 h-10 rounded-full border border-slate-200/60 flex items-center justify-center bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Headphones / Support"
                >
                  <Headphones className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => triggerToast("You have 3 unread team notifications")}
                  className="relative w-10 h-10 rounded-full border border-slate-200/60 flex items-center justify-center bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
              </div>
            </div>
          </header>

          {/* Interactive Live Search Input Widget */}
          <div className="mb-4 relative">
            <input
              id="project-search-input"
              type="text"
              placeholder="Filter by title, client, tag or category in real-time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-4 py-2.5 pl-10 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none border border-slate-100 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* FILTER BAR SECTION */}
          <section id="filter_bar" className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-6">
            
            {/* Grid & List View toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                id="btn-view-grid"
                onClick={() => {
                  setViewMode('grid');
                  triggerToast('Switched to Grid Layout');
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                id="btn-view-list"
                onClick={() => {
                  setViewMode('list');
                  triggerToast('Switched to List Layout');
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown Filters (4 stacked columns) */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[280px]">
              
              {/* Filter 1: Client */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  id="dropdown-client-toggle"
                  onClick={() => setDropdownOpen(dropdownOpen === 'client' ? null : 'client')}
                  className="w-full text-left p-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Client</span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center justify-between mt-0.5">
                    {selectedClient}
                    <span className="text-[10px] text-slate-400 ml-1">▼</span>
                  </span>
                </button>
                {dropdownOpen === 'client' && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-30 overflow-hidden py-1">
                    {['All Clients', 'Client A', 'Client B', 'Client C'].map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          setSelectedClient(c);
                          setDropdownOpen(null);
                          triggerToast(`Filtered Client: ${c}`);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors ${selectedClient === c ? 'font-bold text-[#7358B7]' : 'text-slate-600'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 2: Label */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  id="dropdown-label-toggle"
                  onClick={() => setDropdownOpen(dropdownOpen === 'label' ? null : 'label')}
                  className="w-full text-left p-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Label</span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center justify-between mt-0.5">
                    {selectedLabel === 'All Labels' ? 'All' : selectedLabel}
                    <span className="text-[10px] text-slate-400 ml-1">▼</span>
                  </span>
                </button>
                {dropdownOpen === 'label' && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-30 overflow-hidden py-1">
                    {['All Labels', 'Inprogress', 'Completed', 'Planning', 'Neutral'].map(l => (
                      <button
                        key={l}
                        onClick={() => {
                          setSelectedLabel(l);
                          setDropdownOpen(null);
                          triggerToast(`Filtered Label: ${l}`);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors ${selectedLabel === l ? 'font-bold text-[#7358B7]' : 'text-slate-600'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 3: Category */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  id="dropdown-category-toggle"
                  onClick={() => setDropdownOpen(dropdownOpen === 'category' ? null : 'category')}
                  className="w-full text-left p-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Category</span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center justify-between mt-0.5">
                    {selectedCategory === 'All Categories' ? 'All' : selectedCategory}
                    <span className="text-[10px] text-slate-400 ml-1">▼</span>
                  </span>
                </button>
                {dropdownOpen === 'category' && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-30 overflow-hidden py-1">
                    {['All Categories', 'Internal', 'External', 'Client Work'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setDropdownOpen(null);
                          triggerToast(`Filtered Category: ${cat}`);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors ${selectedCategory === cat ? 'font-bold text-[#7358B7]' : 'text-slate-600'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 4: Sort */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  id="dropdown-sort-toggle"
                  onClick={() => setDropdownOpen(dropdownOpen === 'sort' ? null : 'sort')}
                  className="w-full text-left p-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sort By</span>
                  <span className="text-xs font-semibold text-slate-800 flex items-center justify-between mt-0.5">
                    {sortOption}
                    <span className="text-[10px] text-slate-400 ml-1">▼</span>
                  </span>
                </button>
                {dropdownOpen === 'sort' && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-30 overflow-hidden py-1">
                    {['By Activity', 'By Rating', 'By Name'].map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          setSortOption(s);
                          setDropdownOpen(null);
                          triggerToast(`Sorted: ${s}`);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors ${sortOption === s ? 'font-bold text-[#7358B7]' : 'text-slate-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Clear Filter state button if filter is active */}
            {(selectedClient !== 'All Clients' || selectedLabel !== 'Inprogress' || selectedCategory !== 'Internal' || statFilter || searchQuery) && (
              <button 
                onClick={() => {
                  setSelectedClient('All Clients');
                  setSelectedLabel('All Labels');
                  setSelectedCategory('All Categories');
                  setStatFilter(null);
                  setSearchQuery('');
                  triggerToast('Filters reset to default');
                }}
                className="text-[11px] text-[#7358B7] hover:underline font-bold px-2 py-1"
              >
                Reset Filters
              </button>
            )}
          </section>

          {/* Active stats filter banner */}
          {statFilter && (
            <div className="mb-4 bg-indigo-50 border border-indigo-100 text-[#7358B7] rounded-xl px-4 py-2 flex items-center justify-between text-xs">
              <span className="font-semibold">
                Showing group: <span className="uppercase font-bold underline">{statFilter}</span> metrics
              </span>
              <button onClick={() => setStatFilter(null)} className="text-[#7358B7] hover:underline font-bold flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear Metric Filter
              </button>
            </div>
          )}

          {/* PROJECT CARDS CONTAINER (The Grid or List View) */}
          <div className="flex-1 min-h-[300px]">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-slate-700 font-bold">No projects matched current filters</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-md text-center">
                  Try clearing some filter dropdown values or clicking Reset Filters above to view all tasks.
                </p>
                <button 
                  onClick={() => {
                    setSelectedClient('All Clients');
                    setSelectedLabel('All Labels');
                    setSelectedCategory('All Categories');
                    setStatFilter(null);
                    setSearchQuery('');
                  }}
                  className="mt-4 text-xs font-semibold text-white bg-[#2AB4B3] px-4 py-2 rounded-full"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <motion.div 
                layout 
                className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 gap-5" 
                    : "flex flex-col gap-4"
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project) => {
                    
                    // GRAPHIC CARD (Filled with illustration of two jumping characters)
                    if (project.type === 'graphic') {
                      return (
                        <motion.div
                          key={project.id}
                          layout
                          id={`card-${project.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className={`relative overflow-hidden rounded-[24px] group min-h-[220px] shadow-md flex flex-col justify-end bg-slate-900 border border-indigo-200/20`}
                        >
                          {/* Generated celebration jumping image filled in background */}
                          <img 
                            src={celebrationJumping} 
                            alt="Celebration illustration of jumping characters"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          />
                          {/* Graphic Overlay gradient matching brand purple */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#7358B7] via-slate-950/40 to-transparent mix-blend-multiply opacity-80" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#7358B7]/60 via-transparent to-indigo-500/30" />
                          
                          {/* Text/Content */}
                          <div className="relative z-10 p-5 text-white">
                            <span className="bg-white/25 backdrop-blur-md text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full text-white">
                              TEAM HIGHLIGHT
                            </span>
                            <h3 className="text-lg font-black tracking-tight text-white mt-2 drop-shadow-sm">
                              {project.title}
                            </h3>
                            <p className="text-xs text-white/85 mt-1">
                              Two jumping characters vector illustration. Flat design.
                            </p>
                            
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20 text-[11px] text-white/90 font-medium">
                              <span>Internal template graphic</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerToast("🎉 Hooray! High-five for team celebrations!");
                                }}
                                className="bg-white text-[#7358B7] px-3 py-1 rounded-full font-bold hover:bg-slate-100 transition-colors"
                              >
                                Cheer!
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    // EMPTY / PLACEHOLDER CARD (Ghost card with center icon reading "Make a copy")
                    if (project.type === 'empty') {
                      return (
                        <motion.div
                          key={project.id}
                          layout
                          id={`card-${project.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => {
                            // Finds first standard project to duplicate as template
                            const source = projects.find(p => p.type === 'standard' || p.type === 'internal') || projects[0];
                            duplicateProject(source);
                          }}
                          className="border-2 border-dashed border-slate-300 hover:border-[#7358B7] hover:bg-indigo-50/10 cursor-pointer rounded-[16px] p-6 flex flex-col items-center justify-center text-center group min-h-[220px] transition-all"
                        >
                          <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-400 group-hover:text-[#7358B7] mb-3 transition-colors">
                            <Copy className="w-5 h-5" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Make a copy</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs">
                            Click here to duplicate an existing project blueprint instantly into your workspace log.
                          </p>
                          <span className="mt-3 text-[10px] uppercase font-bold text-[#7358B7] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity">
                            Clone template
                          </span>
                        </motion.div>
                      );
                    }

                    // Standard Standard & Internal / Floating Cards
                    const isFloating = project.type === 'floating';
                    const isInternal = project.type === 'internal';

                    // Label tag colors
                    let labelColorStyle = 'bg-indigo-50 text-indigo-700';
                    if (project.label === 'Inprogress') labelColorStyle = 'bg-amber-100 text-amber-800';
                    if (project.label === 'Completed') labelColorStyle = 'bg-emerald-100 text-emerald-800';
                    if (project.label === 'Planning') labelColorStyle = 'bg-blue-100 text-blue-800';
                    if (project.label === 'Neutral') labelColorStyle = 'bg-slate-100 text-slate-700';
                    if (project.label === 'Break') labelColorStyle = 'bg-[#FEF08A] text-yellow-800 font-semibold'; // Soft yellow

                    return (
                      <motion.div
                        key={project.id}
                        layout
                        id={`card-${project.id}`}
                        initial={{ opacity: 0, y: isFloating ? 20 : 0 }}
                        animate={{ 
                          opacity: 1, 
                          y: isFloating ? 15 : 0, // Sits slightly lower to break grid alignment
                          scale: 1 
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={`bg-white rounded-[16px] p-5 relative border transition-all ${
                          isFloating 
                            ? 'shadow-[0_20px_40px_rgba(115,88,183,0.18)] border-slate-100/80 ring-2 ring-indigo-500/5 hover:translate-y-3 z-20' 
                            : 'border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Interactive Float indicator / visual tag */}
                        {isFloating && (
                          <span className="absolute -top-2.5 left-4 bg-[#7358B7] text-white text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow">
                            Hover Feature
                          </span>
                        )}

                        {/* Top card action line */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                              {project.client}
                            </span>
                            <span className="text-slate-200">•</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${labelColorStyle}`}>
                              {project.label}
                            </span>
                          </div>

                          {/* Quick Actions (Favorite and Delete) */}
                          <div className="flex items-center gap-1.5">
                            {/* Star favorite toggle */}
                            <button
                              onClick={(e) => toggleStar(project.id, e)}
                              className={`p-1 rounded-full transition-colors ${
                                project.isStarred 
                                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                                  : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                              }`}
                              title={project.isStarred ? 'Unstar' : 'Star project'}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>

                            {/* Standard 3-dot dropdown logic */}
                            <div className="relative group/menu">
                              <button 
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              {/* Simple CSS-based hover popover menu */}
                              <div className="absolute right-0 top-6 bg-slate-900 text-white text-xs rounded-xl shadow-xl w-36 py-1 z-30 opacity-0 scale-90 group-hover/menu:opacity-100 group-hover/menu:scale-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all duration-200 origin-top-right">
                                <button 
                                  onClick={(e) => duplicateProject(project, e)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-1.5"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Duplicate
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newName = prompt('Enter new project title:', project.title);
                                    if (newName) {
                                      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, title: newName } : p));
                                      triggerToast('Project renamed');
                                    }
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800"
                                >
                                  Rename
                                </button>
                                <hr className="border-slate-800 my-1" />
                                <button 
                                  onClick={(e) => deleteProject(project.id, e)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-red-950 text-red-400 flex items-center gap-1.5"
                                >
                                  Delete Card
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Title & subtitle bullet points */}
                        <div className="mb-4">
                          <h3 className="font-extrabold text-[#111111] text-base leading-snug hover:text-[#7358B7] transition-colors cursor-pointer">
                            {project.title}
                          </h3>
                          
                          {/* Subtitle bullet points inline separated by dots */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 font-medium">
                            {project.subtitles.map((sub, i) => (
                              <React.Fragment key={i}>
                                <span>{sub}</span>
                                {i < project.subtitles.length - 1 && (
                                  <span className="text-slate-300 font-extrabold">•</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* INTERNAL SPECIAL WIREFRAMES LINE */}
                        {isInternal && (
                          <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                              Wireframe Blueprints Inline (3 distinct file icon outlines)
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { icon: FileText, label: 'assets_v2.fig', size: '3.4M' },
                                { icon: FolderOpen, label: 'structure.json', size: '12K' },
                                { icon: FileCode, label: 'design.css', size: '124K' }
                              ].map((item, idx) => {
                                const FileIcon = item.icon;
                                return (
                                  <div 
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerToast(`Selected wireframe element: ${item.label}`);
                                    }}
                                    className="border border-slate-200 rounded-lg p-2 bg-white flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#7358B7] transition-colors group/wire"
                                  >
                                    <FileIcon className="w-4 h-4 text-slate-400 group-hover/wire:text-[#7358B7] mb-1" />
                                    <span className="text-[9px] font-bold text-slate-700 truncate w-full">
                                      {item.label}
                                    </span>
                                    <span className="text-[8px] font-medium text-slate-400">
                                      {item.size}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Bottom Card elements (Overlapping Avatars & Time indicator & Star rating interactive) */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-50 mt-2">
                          
                          {/* Overlapping Avatars stack */}
                          <div className="flex items-center">
                            {project.avatars.length > 0 ? (
                              <div className="flex -space-x-1.5 overflow-hidden">
                                {project.avatars.map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt="Collaborator member"
                                    referrerPolicy="no-referrer"
                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                  />
                                ))}
                                {project.id === 'proj-1' && (
                                  <div className="inline-block h-6 w-6 rounded-full bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                                    +2
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No members</span>
                            )}
                            
                            <span className="text-[10px] text-slate-400 font-medium ml-2">
                              {project.time}
                            </span>
                          </div>

                          {/* Star Rating interactive indicators */}
                          <div className="flex items-center gap-0.5" title={`Rating: ${project.rating}/5`}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={(e) => setProjectRating(project.id, star, e)}
                                className={`transition-colors ${
                                  star <= project.rating 
                                    ? 'text-amber-400 hover:text-amber-500' 
                                    : 'text-slate-200 hover:text-amber-300'
                                }`}
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>
                            ))}
                          </div>

                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Quick interactive tips helper */}
          <footer className="mt-8 pt-4 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>💡 <strong>Developer Tip:</strong> Click on the statistics numbers in the right sidebar to instantly filter the dashboard view.</span>
            <span className="font-medium text-[#7358B7] hover:underline cursor-pointer" onClick={() => triggerToast("Developed with React 19 + Tailwind v4")}>
              Mosaik Creative Framework v2.4
            </span>
          </footer>

        </main>

        {/* RIGHT PROFILE & ACTIVITY SIDEBAR (Clear white background) */}
        <aside 
          id="right_sidebar" 
          className="bg-white border-t lg:border-t-0 lg:border-l border-slate-100 p-6 flex flex-col justify-between w-full lg:w-[360px] max-h-screen lg:overflow-y-auto"
        >
          {/* TOP PROFILE SECTION */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {/* User Mascot Circle over a coral background */}
                <div 
                  id="profile-mascot-container"
                  className="w-12 h-12 rounded-full bg-[#FFA07A] flex items-center justify-center overflow-hidden border-2 border-orange-200 shadow-sm relative group cursor-pointer"
                  onClick={() => triggerToast("Hello, Sullivan! You are currently the owner of this workspace.")}
                >
                  <img 
                    src={mascotAvatar} 
                    alt="Sullivan mascot avatar" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900 leading-tight">Hello, Sullivan</h2>
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Senior Creative Director
                  </span>
                </div>
              </div>

              {/* Three-dot vertical options */}
              <div className="relative group/profile-opt">
                <button 
                  className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800"
                  title="Profile Settings"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {/* CSS Dropdown */}
                <div className="absolute right-0 top-8 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl w-36 py-1 z-30 opacity-0 scale-90 group-hover/profile-opt:opacity-100 group-hover/profile-opt:scale-100 pointer-events-none group-hover/profile-opt:pointer-events-auto transition-all duration-200 origin-top-right">
                  <button 
                    onClick={() => triggerToast("Switching profile avatar mascot is coming soon!")}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800"
                  >
                    Change Mascot
                  </button>
                  <button 
                    onClick={() => triggerToast("User email: uiuxalif01@gmail.com")}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800"
                  >
                    View Account ID
                  </button>
                  <hr className="border-slate-800 my-1" />
                  <button 
                    onClick={() => triggerToast("Successfully logged out!")}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-950 text-red-400"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 mb-5" />

            {/* METRICS GRID (2x2 Displaying dynamic stats) */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Project Metrics Overview</h3>
              
              <div id="metrics-grid-element" className="grid grid-cols-2 gap-3">
                
                {/* Metric 1: Total (Blue accent line) */}
                <button
                  onClick={() => {
                    setStatFilter(statFilter === 'total' ? null : 'total');
                    triggerToast(statFilter === 'total' ? 'Showing all projects' : 'Filtering by total projects');
                  }}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    statFilter === 'total' 
                      ? 'border-blue-500 bg-blue-50/40 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  } border-l-4 border-l-blue-500`}
                >
                  <span className="text-[10px] font-bold text-slate-400 block truncate">Total Projects</span>
                  <span className="text-2xl font-black text-slate-950 block mt-1">{stats.total}</span>
                </button>

                {/* Metric 2: Completed (Green accent line) */}
                <button
                  onClick={() => {
                    setStatFilter(statFilter === 'completed' ? null : 'completed');
                    triggerToast(statFilter === 'completed' ? 'Showing all projects' : 'Filtering Completed projects');
                  }}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    statFilter === 'completed' 
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  } border-l-4 border-l-emerald-500`}
                >
                  <span className="text-[10px] font-bold text-slate-400 block truncate">Completed</span>
                  <span className="text-2xl font-black text-slate-950 block mt-1">{stats.completed}</span>
                </button>

                {/* Metric 3: In Progress (Orange accent line) */}
                <button
                  onClick={() => {
                    setStatFilter(statFilter === 'inprogress' ? null : 'inprogress');
                    triggerToast(statFilter === 'inprogress' ? 'Showing all projects' : 'Filtering In Progress projects');
                  }}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    statFilter === 'inprogress' 
                      ? 'border-amber-500 bg-amber-50/40 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  } border-l-4 border-l-amber-500`}
                >
                  <span className="text-[10px] font-bold text-slate-400 block truncate">In Progress</span>
                  <span className="text-2xl font-black text-slate-950 block mt-1">{stats.inProgress}</span>
                </button>

                {/* Metric 4: Out of Schedule (Red accent line) */}
                <button
                  onClick={() => {
                    setStatFilter(statFilter === 'outofschedule' ? null : 'outofschedule');
                    triggerToast(statFilter === 'outofschedule' ? 'Showing all projects' : 'Filtering Neutral / Planned projects');
                  }}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    statFilter === 'outofschedule' 
                      ? 'border-rose-500 bg-rose-50/40 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  } border-l-4 border-l-rose-500`}
                >
                  <span className="text-[10px] font-bold text-slate-400 block truncate">Out of Schedule</span>
                  <span className="text-2xl font-black text-slate-950 block mt-1">{stats.outOfSchedule}</span>
                </button>

              </div>
            </div>
          </div>

          {/* MIDDLE ACTIVITY FEED */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-[220px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity Feed</h3>
              <button 
                onClick={() => {
                  setActivities(INITIAL_ACTIVITIES);
                  triggerToast('Activities log reloaded');
                }}
                className="text-[10px] text-[#7358B7] hover:underline font-bold"
              >
                Reset Feed
              </button>
            </div>

            {/* Clean list of recent tasks */}
            <div id="activity-feed-list" className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[300px]">
              <AnimatePresence initial={false}>
                {activities.map((activity) => {
                  const isMascotSullivan = activity.userName === 'Sullivan';
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-start gap-2.5"
                    >
                      {/* Avatar picture */}
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-100 bg-slate-100">
                        {isMascotSullivan ? (
                          <img 
                            src={mascotAvatar} 
                            alt="Sullivan avatar" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : activity.userAvatar ? (
                          <img 
                            src={activity.userAvatar} 
                            alt={activity.userName} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600 bg-indigo-50">
                            {activity.userName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Light-gray rounded speech bubble container */}
                      <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100 relative">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-extrabold text-slate-900">{activity.userName}</span>
                          <span className="text-[9px] text-slate-400 font-medium">{activity.time}</span>
                        </div>
                        
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {activity.text}
                        </p>

                        {/* Crucial requirement: The second activity bubble contains an inner pill-badge highlighted in pastel yellow ("Coffee Break") */}
                        {activity.badge && (
                          <div className="mt-1.5">
                            <span className="inline-block text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-[#FEF08A] text-yellow-800 shadow-sm border border-yellow-200">
                              {activity.badge}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={activityEndRef} />
            </div>

            {/* Quick status generator buttons to make feed super interactive */}
            <div className="my-3 flex flex-wrap gap-1.5">
              <button 
                onClick={() => sendQuickMessage('Going offline for lunch break. Back in 30m! 🥪', 'Lunch Break')}
                className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2.5 py-1 hover:bg-amber-100"
              >
                + Lunch break
              </button>
              <button 
                onClick={() => sendQuickMessage('Grabbed some fresh cappuccino. Let us connect in 15 mins!', 'Coffee Break')}
                className="text-[9px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full px-2.5 py-1 hover:bg-yellow-100"
              >
                + Coffee break
              </button>
              <button 
                onClick={() => sendQuickMessage('Finished code review for the Mobile App mockup. Green flags! ✅', 'Review done')}
                className="text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-2.5 py-1 hover:bg-emerald-100"
              >
                + Review finished
              </button>
            </div>

            {/* BOTTOM INPUT CHAT BOX */}
            <form onSubmit={handleSendMessage} className="relative mt-2">
              <input
                type="text"
                placeholder="Message Sullivan and team..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200/50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-full py-3.5 pl-4 pr-12 outline-none border border-transparent focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                {/* Smiley/emoji icon */}
                <button
                  type="button"
                  onClick={() => {
                    setMessageInput(prev => prev + " 🤩");
                    triggerToast("Added star emoji!");
                  }}
                  className="hover:text-[#7358B7] p-0.5 rounded transition-colors"
                  title="Add Star Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="hover:text-[#2AB4B3] p-0.5 rounded transition-colors"
                  title="Send Message"
                >
                  <Send className="w-3.5 h-3.5 text-[#2AB4B3]" />
                </button>
              </div>
            </form>
          </div>
        </aside>

      </div>

      {/* DIALOG/MODAL FOR STARTING A NEW PROJECT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="bg-[#7358B7] p-5 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Start a New Project</h3>
                  <p className="text-xs text-white/80">Populate project blueprint parameters below</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Android Store App"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#7358B7]"
                  />
                </div>

                {/* Subtitles (bullet points comma separated) */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Subtitles / Badges (separated by commas)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. iOS App, Figma, Phase 1"
                    value={newSubtitles}
                    onChange={(e) => setNewSubtitles(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#7358B7]"
                  />
                </div>

                {/* Selection Fields row */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Client selection */}
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Client
                    </label>
                    <select
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#7358B7]"
                    >
                      <option value="Client A">Client A</option>
                      <option value="Client B">Client B</option>
                      <option value="Client C">Client C</option>
                      <option value="All Clients">All Clients</option>
                    </select>
                  </div>

                  {/* Rating Selection */}
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Initial Rating (1-5)
                    </label>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className={`transition-colors ${
                            star <= newRating ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Category & Status Labels */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Status Label selection */}
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Label Status
                    </label>
                    <select
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value as ProjectLabel)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#7358B7]"
                    >
                      <option value="Inprogress">Inprogress</option>
                      <option value="Completed">Completed</option>
                      <option value="Planning">Planning</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Break">Break</option>
                    </select>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ProjectCategory)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#7358B7]"
                    >
                      <option value="Internal">Internal</option>
                      <option value="External">External</option>
                      <option value="Client Work">Client Work</option>
                    </select>
                  </div>

                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2AB4B3] text-white font-bold px-5 py-2 rounded-lg text-xs hover:bg-[#239c9b] transition-colors"
                  >
                    Publish Project
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
