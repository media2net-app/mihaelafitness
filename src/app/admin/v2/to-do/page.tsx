'use client';

import { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Star,
  Tag,
  Users,
  FileText,
  Bell,
  Flag,
  Archive,
  RotateCcw,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Task Card Component
function TaskCard({ task, onEdit, onDelete, onToggle, onView }: {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (task: any) => void;
  onToggle: (task: any) => void;
  onView: (task: any) => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'client': return <Users className="w-4 h-4" />;
      case 'admin': return <FileText className="w-4 h-4" />;
      case 'marketing': return <Target className="w-4 h-4" />;
      case 'urgent': return <Zap className="w-4 h-4" />;
      default: return <CheckSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${
      task.completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggle(task)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.completed && <CheckCircle className="w-4 h-4" />}
          </button>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
              {task.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <div className="flex items-center gap-1">
              {getPriorityIcon(task.priority)}
              {task.priority}
            </div>
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(task)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button onClick={() => onEdit(task)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => onDelete(task)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            {getCategoryIcon(task.category)}
          </div>
          <div className="text-sm font-medium text-gray-900 capitalize">{task.category}</div>
          <div className="text-xs text-gray-500">Category</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{task.estimatedTime || '--'}</div>
          <div className="text-xs text-gray-500">Est. Time</div>
          <div className="text-xs text-gray-400">minutes</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{task.progress || 0}%</div>
          <div className="text-xs text-gray-500">Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
              style={{ width: `${task.progress || 0}%` }}
            ></div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{task.tags?.length || 0}</div>
          <div className="text-xs text-gray-500">Tags</div>
          <div className="text-xs text-gray-400">attached</div>
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{task.assignee || 'Unassigned'}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Created {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Quick Stats Component
function QuickStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">+{stats.newToday} today</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.completionRate}% completion rate</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-yellow-500 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">{stats.overdue} overdue</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-red-500 rounded-lg">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.highPriority}</div>
            <div className="text-sm text-gray-500">High Priority</div>
          </div>
        </div>
        <div className="text-xs text-gray-600">urgent tasks</div>
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <Plus className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Add Task</div>
            <div className="text-sm text-gray-500">Create new task</div>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Mark Complete</div>
            <div className="text-sm text-gray-500">Finish tasks</div>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
          <Flag className="w-5 h-5 text-yellow-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Set Priority</div>
            <div className="text-sm text-gray-500">Mark urgent</div>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          <Archive className="w-5 h-5 text-purple-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Archive</div>
            <div className="text-sm text-gray-500">Clean up</div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function ToDoListV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockTasks = [
        {
          id: '1',
          title: 'Review client progress photos',
          description: 'Analyze and provide feedback on Sarah\'s week 4 progress photos',
          category: 'Client',
          priority: 'High',
          completed: false,
          progress: 75,
          estimatedTime: 30,
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          assignee: 'Mihaela',
          tags: ['photos', 'progress', 'feedback'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Update nutrition plan for Mike',
          description: 'Adjust macros based on his recent measurements',
          category: 'Client',
          priority: 'Medium',
          completed: false,
          progress: 40,
          estimatedTime: 45,
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          assignee: 'Mihaela',
          tags: ['nutrition', 'macros', 'measurements'],
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          title: 'Prepare workout templates',
          description: 'Create new HIIT workout templates for group classes',
          category: 'Admin',
          priority: 'Low',
          completed: true,
          progress: 100,
          estimatedTime: 60,
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          assignee: 'Mihaela',
          tags: ['workouts', 'templates', 'hiit'],
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: '4',
          title: 'Schedule client consultations',
          description: 'Book follow-up sessions for next week',
          category: 'Admin',
          priority: 'High',
          completed: false,
          progress: 20,
          estimatedTime: 20,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          assignee: 'Mihaela',
          tags: ['scheduling', 'consultations'],
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: '5',
          title: 'Update social media content',
          description: 'Post progress stories and client testimonials',
          category: 'Marketing',
          priority: 'Medium',
          completed: false,
          progress: 60,
          estimatedTime: 25,
          dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
          assignee: 'Mihaela',
          tags: ['social-media', 'content', 'marketing'],
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
        }
      ];
      
      setTasks(mockTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed);
    const matchesPriority = filterPriority === 'all' || task.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchesCategory = filterCategory === 'all' || task.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'dueDate': return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
      case 'priority': return a.priority.localeCompare(b.priority);
      case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'title': return a.title.localeCompare(b.title);
      default: return 0;
    }
  });

  const stats = {
    totalTasks: tasks.length,
    newToday: 3,
    completed: tasks.filter(t => t.completed).length,
    completionRate: Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100),
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length,
    highPriority: tasks.filter(t => t.priority === 'High' && !t.completed).length
  };

  const handleToggleTask = (task: any) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleEditTask = (task: any) => {
    console.log('Edit task:', task);
    // TODO: Implement edit functionality
  };

  const handleDeleteTask = (task: any) => {
    console.log('Delete task:', task);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const handleViewTask = (task: any) => {
    console.log('View task:', task);
    // TODO: Implement view functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">To-Do List</h1>
              <p className="text-gray-600 mt-1">Manage your tasks and stay organized</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Archive className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Archive</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={stats} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
              <option value="marketing">Marketing</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created">Created Date</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
                onView={handleViewTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">Create your first task to get started</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mx-auto">
              <Plus className="w-5 h-5" />
              <span>Add First Task</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}













