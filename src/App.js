import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, Star, Filter, Search, X, RotateCcw, Trash2 } from 'lucide-react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [blockedTasks, setBlockedTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newPriority, setNewPriority] = useState('M');
  const [newTags, setNewTags] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [hiddenTags, setHiddenTags] = useState([]);
  const [hiddenProjects, setHiddenProjects] = useState([]);
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'completed', 'blocked', or 'archived'
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'project', 'tags', 'created', 'completed'
  const [newNote, setNewNote] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const availableTags = ['Productivity', 'Personal', 'Work', 'Learning', 'Health', 'Finance', 'Shopping', 'Travel'];
  const availableProjects = ['default', 'productivity', 'work', 'personal', 'learning', 'health'];

  const formatTaskDate = (dateString) => {
    if (!dateString) return 'N/A';
    // TaskWarrior format: 20251223T034538Z
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString();
  };

  const formatTaskDateToJS = (dateString) => {
    if (!dateString) return null;
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const archiveTask = async (id, uuid, isAutoArchive = false) => {
    try {
      const taskIdentifier = uuid || id;
      const response = await fetch(`http://localhost:3001/api/tasks/${taskIdentifier}/archive`, {
        method: 'POST',
      });
      
      if (response.ok && !isAutoArchive) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error archiving task:', error);
    }
  };

  const unarchiveTask = async (id, uuid) => {
    try {
      const taskIdentifier = uuid || id;
      const response = await fetch(`http://localhost:3001/api/tasks/${taskIdentifier}/unarchive`, {
        method: 'POST',
      });
      
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error unarchiving task:', error);
    }
  };

  // Get all unique tags from existing tasks
  const getAllUniqueTags = () => {
    const allTasks = [...tasks, ...completedTasks];
    const tagSet = new Set();
    allTasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  };

  // Get all unique projects from existing tasks
  const getAllUniqueProjects = () => {
    const allTasks = [...tasks, ...completedTasks];
    const projectSet = new Set();
    allTasks.forEach(task => {
      if (task.project) {
        projectSet.add(task.project);
      }
    });
    return Array.from(projectSet).sort();
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      console.log('Raw data:', data.length, 'tasks');
      console.log('Statuses:', data.map(t => t.status));
      
      // Filter out deleted tasks and separate pending, completed, blocked, and archived tasks
      const activeTasks = data.filter(task => task.status !== 'deleted');
      const pending = activeTasks.filter(task => task.status === 'pending' && !task.wait);
      const blocked = activeTasks.filter(task => task.wait || task.status === 'waiting');
      
      // Auto-archive completed tasks older than 60 days
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const completed = activeTasks.filter(task => {
        if (task.status !== 'completed') return false;
        if (!task.tags || !task.tags.includes('archived')) {
          // Check if task should be auto-archived
          if (task.end) {
            const completedDate = new Date(formatTaskDateToJS(task.end));
            if (completedDate < sixtyDaysAgo) {
              // Auto-archive this task
              archiveTask(task.id, task.uuid, true);
              return false;
            }
          }
        }
        return !task.tags || !task.tags.includes('archived');
      });
      
      const archived = activeTasks.filter(task => 
        task.status === 'completed' && task.tags && task.tags.includes('archived')
      );
      
      // Add fullDescription and ensure all required fields exist
      const enhancedPending = pending.map(task => ({
        ...task,
        fullDescription: task.annotations?.[0]?.description || task.description,
        tags: task.tags || [],
        project: task.project || 'default',
        priority: task.priority || 'M',
        urgency: task.urgency || 0
      }));
      
      const enhancedCompleted = completed.map(task => ({
        ...task,
        fullDescription: task.annotations?.[0]?.description || task.description,
        tags: task.tags || [],
        project: task.project || 'default',
        priority: task.priority || 'M',
        urgency: task.urgency || 0,
        completedAt: task.end || new Date().toISOString()
      }));
      
      const enhancedBlocked = blocked.map(task => ({
        ...task,
        fullDescription: task.annotations?.[0]?.description || task.description,
        tags: task.tags || [],
        project: task.project || 'default',
        priority: task.priority || 'M',
        urgency: task.urgency || 0
      }));
      
      const enhancedArchived = archived.map(task => ({
        ...task,
        fullDescription: task.annotations?.[0]?.description || task.description,
        tags: task.tags || [],
        project: task.project || 'default',
        priority: task.priority || 'M',
        urgency: task.urgency || 0,
        completedAt: task.end || new Date().toISOString()
      }));
      
      setTasks(enhancedPending);
      setCompletedTasks(enhancedCompleted);
      setBlockedTasks(enhancedBlocked);
      setArchivedTasks(enhancedArchived);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Set empty arrays on error
      setTasks([]);
      setCompletedTasks([]);
      setBlockedTasks([]);
      setArchivedTasks([]);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newTask,
          fullDescription: newDescription, // Add the detailed description
          project: newProject || 'default',
          priority: newPriority,
          tags: newTags
        }),
      });
      
      if (response.ok) {
        setNewTask('');
        setNewDescription('');
        setNewProject('');
        setNewPriority('M');
        setNewTags([]);
        loadTasks();
      } else {
        console.error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (taskData) => {
    console.log('Updating task with data:', taskData);
    try {
      const payload = {
        description: taskData.description,
        project: taskData.project,
        priority: taskData.priority,
        tags: taskData.tags,
        status: taskData.status
      };
      console.log('Sending payload:', payload);
      
      const response = await fetch(`http://localhost:3001/api/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        loadTasks();
        setShowEditModal(false);
        setEditingTask(null);
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const openEditModal = (task) => {
    setEditingTask({
      ...task,
      tags: task.tags || [],
      project: task.project || 'default',
      priority: task.priority || 'M',
      status: task.status || 'pending'
    });
    setShowEditModal(true);
  };

  const addNote = async (taskId) => {
    if (!newNote.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/annotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: newNote }),
      });
      
      if (response.ok) {
        setNewNote('');
        loadTasks();
      } else {
        console.error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const completeTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${id}/complete`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Show celebration
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        
        // Reload tasks to get the updated list
        loadTasks();
      } else {
        console.error('Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
    setDeleteConfirmText('');
  };

  const deleteTask = async () => {
    console.log('Delete confirmation text:', deleteConfirmText);
    if (deleteConfirmText !== 'deleteme') {
      console.log('Confirmation text does not match');
      return;
    }
    
    console.log('Attempting to delete task:', taskToDelete);
    
    try {
      const taskIdentifier = taskToDelete.uuid || taskToDelete.id;
      console.log('Using task identifier:', taskIdentifier);
      
      const response = await fetch(`http://localhost:3001/api/tasks/${taskIdentifier}`, {
        method: 'DELETE',
      });
      
      console.log('Delete response:', response);
      
      if (response.ok) {
        console.log('Task deleted successfully');
        loadTasks();
        closeDeleteModal();
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const uncompleteTask = async (id, uuid) => {
    console.log('Reopening task with id:', id, 'uuid:', uuid);
    try {
      // Use uuid for completed tasks since they have id=0
      const taskIdentifier = uuid || id;
      console.log('Using task identifier:', taskIdentifier);
      
      const response = await fetch(`http://localhost:3001/api/tasks/${taskIdentifier}/reopen`, {
        method: 'POST',
      });
      
      console.log('Reopen response:', response);
      
      if (response.ok) {
        console.log('Task reopened successfully');
        // Reload tasks to get the updated list
        loadTasks();
      } else {
        console.error('Failed to reopen task');
      }
    } catch (error) {
      console.error('Error reopening task:', error);
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
  };

  const toggleTag = (tag) => {
    setNewTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleEditTag = (tag) => {
    setEditingTask(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'H': return '#ff4757';
      case 'M': return '#ffa502';
      case 'L': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getProjectColor = (project) => {
    const colors = ['#3742fa', '#2f3542', '#ff6348', '#1e90ff', '#ff9ff3'];
    return colors[project?.length % colors.length] || '#747d8c';
  };

  // Clear filters when switching view modes
  useEffect(() => {
    setFilter('all');
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedProjects([]);
  }, [viewMode]);

  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'H': 3, 'M': 2, 'L': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'project':
          return (a.project || '').localeCompare(b.project || '');
        case 'tags':
          const aTag = a.tags?.[0] || '';
          const bTag = b.tags?.[0] || '';
          return aTag.localeCompare(bTag);
        case 'created':
          return new Date(b.entry || 0) - new Date(a.entry || 0);
        case 'completed':
          return new Date(b.end || 0) - new Date(a.end || 0);
        default:
          return 0;
      }
    });
  };

  const getTasksForView = () => {
    switch (viewMode) {
      case 'pending': return tasks;
      case 'completed': return completedTasks;
      case 'blocked': return blockedTasks;
      case 'archived': return archivedTasks;
      default: return tasks;
    }
  };

  const filteredTasks = sortTasks(getTasksForView()
    .filter(task => {
      const statusMatches = 
        (viewMode === 'pending' && task.status === 'pending' && !task.wait && task.status !== 'deleted') ||
        (viewMode === 'completed' && task.status === 'completed' && task.status !== 'deleted' && (!task.tags || !task.tags.includes('archived'))) ||
        (viewMode === 'blocked' && (task.wait || task.status === 'waiting') && task.status !== 'deleted') ||
        (viewMode === 'archived' && task.status === 'completed' && task.tags && task.tags.includes('archived'));
      if (!statusMatches) return false;
      
      const matchesFilter = filter === 'all' || 
        (filter === 'high' && task.priority === 'H') ||
        (filter === 'medium' && task.priority === 'M') ||
        (filter === 'low' && task.priority === 'L');
      
      const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.fullDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        (task.tags && selectedTags.some(selectedTag => task.tags.includes(selectedTag)));
      
      const matchesProjects = selectedProjects.length === 0 || 
        selectedProjects.includes(task.project);
      
      const hiddenByTags = hiddenTags.length > 0 && 
        task.tags && hiddenTags.some(hiddenTag => task.tags.includes(hiddenTag));
      
      const hiddenByProjects = hiddenProjects.length > 0 && 
        hiddenProjects.includes(task.project);
      
      return matchesFilter && matchesSearch && matchesTags && matchesProjects && !hiddenByTags && !hiddenByProjects;
    }));

  return (
    <div className="app">
      <div className="header">
        <div className="header-title">
          <img src="/images/logo.png" alt="TaskWarrior UI" className="app-logo" />
          <h1>TaskWarrior UI</h1>
        </div>
        <div className="header-controls">
          <div className="view-toggle">
            <button 
              className={viewMode === 'pending' ? 'active' : ''}
              onClick={() => setViewMode('pending')}
            >
              Pending ({tasks.length})
            </button>
            <button 
              className={viewMode === 'completed' ? 'active' : ''}
              onClick={() => setViewMode('completed')}
            >
              Completed ({completedTasks.length})
            </button>
            <button 
              className={viewMode === 'blocked' ? 'active' : ''}
              onClick={() => setViewMode('blocked')}
            >
              Blocked ({blockedTasks.length})
            </button>
            <button 
              className={viewMode === 'archived' ? 'active' : ''}
              onClick={() => setViewMode('archived')}
            >
              Archived ({archivedTasks.length})
            </button>
          </div>
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-chips-container">
            <div className="filter-chips">
              {selectedTags.map(tag => (
                <span key={`tag-${tag}`} className="filter-chip tag-chip">
                  {tag}
                  <button onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              {selectedProjects.map(project => (
                <span key={`project-${project}`} className="filter-chip project-chip">
                  {project}
                  <button onClick={() => setSelectedProjects(prev => prev.filter(p => p !== project))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              {hiddenTags.map(tag => (
                <span key={`hidden-tag-${tag}`} className="filter-chip hidden-tag-chip">
                  -{tag}
                  <button onClick={() => setHiddenTags(prev => prev.filter(t => t !== tag))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              {hiddenProjects.map(project => (
                <span key={`hidden-project-${project}`} className="filter-chip hidden-project-chip">
                  -{project}
                  <button onClick={() => setHiddenProjects(prev => prev.filter(p => p !== project))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="dropdown-selectors">
            <select 
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedTags.includes(e.target.value)) {
                  setSelectedTags(prev => [...prev, e.target.value]);
                }
              }}
              className="filter-select"
            >
              <option value="">+ Add Tag</option>
              {getAllUniqueTags().filter(tag => !selectedTags.includes(tag)).map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select 
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedProjects.includes(e.target.value)) {
                  setSelectedProjects(prev => [...prev, e.target.value]);
                }
              }}
              className="filter-select"
            >
              <option value="">+ Add Project</option>
              {getAllUniqueProjects().filter(project => !selectedProjects.includes(project)).map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
            <select 
              value=""
              onChange={(e) => {
                if (e.target.value && !hiddenTags.includes(e.target.value)) {
                  setHiddenTags(prev => [...prev, e.target.value]);
                }
              }}
              className="filter-select hide-select"
            >
              <option value="">- Hide Tag</option>
              {getAllUniqueTags().filter(tag => !hiddenTags.includes(tag)).map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select 
              value=""
              onChange={(e) => {
                if (e.target.value && !hiddenProjects.includes(e.target.value)) {
                  setHiddenProjects(prev => [...prev, e.target.value]);
                }
              }}
              className="filter-select hide-select"
            >
              <option value="">- Hide Project</option>
              {getAllUniqueProjects().filter(project => !hiddenProjects.includes(project)).map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
          <div className="filter-buttons">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="priority">Sort by Priority</option>
              <option value="project">Sort by Project</option>
              <option value="tags">Sort by Tags</option>
              <option value="created">Sort by Created Date</option>
              {viewMode === 'completed' && <option value="completed">Sort by Completed Date</option>}
            </select>
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'high' ? 'active' : ''}
              onClick={() => setFilter('high')}
            >
              High
            </button>
            <button 
              className={filter === 'medium' ? 'active' : ''}
              onClick={() => setFilter('medium')}
            >
              Medium
            </button>
            <button 
              className={filter === 'low' ? 'active' : ''}
              onClick={() => setFilter('low')}
            >
              Low
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'pending' && (
        <div className="add-task">
          <div className="task-inputs">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <textarea
              placeholder="Task description (optional)..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows="2"
            />
            <div className="task-options">
              <div className="project-input-container">
                <select 
                  value={newProject} 
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setNewProject('');
                    } else {
                      setNewProject(e.target.value);
                    }
                  }}
                  className="project-select"
                >
                  <option value="">Select Project</option>
                  {[...new Set([...availableProjects, ...getAllUniqueProjects()])].map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                  <option value="__custom__">+ Add New Project</option>
                </select>
                {(newProject === '' || !([...availableProjects, ...getAllUniqueProjects()].includes(newProject))) && (
                  <input
                    type="text"
                    placeholder="Enter new project name..."
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="custom-project-input"
                  />
                )}
              </div>
              <select 
                value={newPriority} 
                onChange={(e) => setNewPriority(e.target.value)}
                className="priority-select"
              >
                <option value="L">Low Priority</option>
                <option value="M">Medium Priority</option>
                <option value="H">High Priority</option>
              </select>
            </div>
            <div className="tags-section">
              <label>Tags:</label>
              <div className="tags-container">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-button ${newTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={addTask} className="add-btn">
            <Plus size={20} />
            Add Task
          </button>
        </div>
      )}

      <div className="tasks-container">
        {viewMode === 'archived' ? (
          <div className="archived-list">
            {filteredTasks.length === 0 ? (
              <div className="archived-item">No archived tasks found</div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.uuid} className="archived-item">
                  <div className="archived-content">
                    <span className="archived-description">{task.description}</span>
                    <span className="archived-project">{task.project}</span>
                    <span className="archived-completed">{formatTaskDate(task.end)}</span>
                  </div>
                  <div className="archived-actions">
                    <button 
                      className="unarchive-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        unarchiveTask(task.id, task.uuid);
                      }}
                      title="Unarchive task"
                    >
                      📂
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(task);
                      }}
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.uuid} className="task-card" onClick={() => openTaskModal(task)}>
            <div className="task-header">
              <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                {task.priority}
              </div>
              <div className="task-project" style={{ backgroundColor: getProjectColor(task.project) }}>
                {task.project}
              </div>
              <div className="task-urgency">
                <Star size={16} />
                {task.urgency}
              </div>
            </div>
            <div className="task-description">
              {task.description}
            </div>
            {task.tags && task.tags.length > 0 && (
              <div className="task-tags">
                {task.tags.map(tag => (
                  <span key={tag} className="task-tag">{tag}</span>
                ))}
              </div>
            )}
            <div className="task-dates">
              <div className="created-date">
                Created: {formatTaskDate(task.entry)}
              </div>
              {viewMode === 'completed' && task.end && (
                <div className="completed-date">
                  Completed: {formatTaskDate(task.end)}
                </div>
              )}
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              {viewMode === 'pending' ? (
                <>
                  <button className="edit-btn" onClick={() => openEditModal(task)}>
                    Edit
                  </button>
                  <button className="complete-btn" onClick={() => completeTask(task.id)}>
                    <CheckCircle size={18} />
                    Complete
                  </button>
                  <button className="delete-btn" onClick={() => openDeleteModal(task)}>
                    <Trash2 size={16} />
                  </button>
                </>
              ) : viewMode === 'completed' ? (
                <>
                  <button className="uncomplete-btn" onClick={() => uncompleteTask(task.id, task.uuid)}>
                    <RotateCcw size={18} />
                    Reopen
                  </button>
                  <button className="archive-btn" onClick={() => archiveTask(task.id, task.uuid)}>
                    📦
                  </button>
                  <button className="delete-btn" onClick={() => openDeleteModal(task)}>
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button className="uncomplete-btn" onClick={() => uncompleteTask(task.id, task.uuid)}>
                    <RotateCcw size={18} />
                    Unblock
                  </button>
                  <button className="delete-btn" onClick={() => openDeleteModal(task)}>
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
          ))
        )}
      </div>

      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <Clock size={48} />
          <h3>No {viewMode} tasks found</h3>
          <p>{viewMode === 'pending' ? 'Add a new task or adjust your filters' : viewMode === 'completed' ? 'Complete some tasks to see them here' : 'Block some tasks to see them here'}</p>
        </div>
      )}

      {showModal && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTask.description}</h2>
              <button className="close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="task-meta">
                <div className="meta-item">
                  <strong>Priority:</strong>
                  <span className="priority-badge" style={{ backgroundColor: getPriorityColor(selectedTask.priority) }}>
                    {selectedTask.priority}
                  </span>
                </div>
                <div className="meta-item">
                  <strong>Project:</strong>
                  <span className="project-badge" style={{ backgroundColor: getProjectColor(selectedTask.project) }}>
                    {selectedTask.project}
                  </span>
                </div>
                <div className="meta-item">
                  <strong>Urgency:</strong>
                  <span className="urgency-score">
                    <Star size={16} />
                    {selectedTask.urgency}
                  </span>
                </div>
                {selectedTask.completedAt && (
                  <div className="meta-item">
                    <strong>Completed:</strong>
                    <span>{formatTaskDate(selectedTask.end)}</span>
                  </div>
                )}
              </div>
              <div className="task-full-description">
                <h3>Description</h3>
                <p>{selectedTask.fullDescription}</p>
              </div>
              {selectedTask.annotations && selectedTask.annotations.length > 0 && (
                <div className="task-notes">
                  <h3>Notes</h3>
                  {selectedTask.annotations.map((annotation, index) => (
                    <div key={index} className="note-item">
                      <p>{annotation.description}</p>
                      <small>{new Date(annotation.entry).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              )}
              <div className="add-note-section">
                <h3>Add Note</h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note, link, or additional context..."
                  rows="3"
                />
                <button 
                  className="add-note-btn" 
                  onClick={() => { addNote(selectedTask.id); }}
                  disabled={!newNote.trim()}
                >
                  Add Note
                </button>
              </div>
            </div>
            <div className="modal-actions">
              {selectedTask.status === 'pending' ? (
                <button className="complete-btn" onClick={() => { completeTask(selectedTask.id); closeModal(); }}>
                  <CheckCircle size={18} />
                  Complete Task
                </button>
              ) : (
                <button className="uncomplete-btn" onClick={() => { uncompleteTask(selectedTask.id, selectedTask.uuid); closeModal(); }}>
                  <RotateCcw size={18} />
                  Reopen Task
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingTask && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button className="close-btn" onClick={closeEditModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="edit-form">
                <input
                  type="text"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  placeholder="Task description"
                />
                <select 
                  value={editingTask.project || ''} 
                  onChange={(e) => setEditingTask({...editingTask, project: e.target.value})}
                >
                  {[...new Set([...availableProjects, ...getAllUniqueProjects()])].map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
                <select 
                  value={editingTask.priority || 'M'} 
                  onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                >
                  <option value="L">Low Priority</option>
                  <option value="M">Medium Priority</option>
                  <option value="H">High Priority</option>
                </select>
                <select 
                  value={editingTask.status || 'pending'} 
                  onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="waiting">Blocked</option>
                </select>
                <div className="tags-section">
                  <label>Tags:</label>
                  <div className="tags-container">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`tag-button ${editingTask.tags?.includes(tag) ? 'selected' : ''}`}
                        onClick={() => toggleEditTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
              <button className="save-btn" onClick={() => updateTask(editingTask)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && taskToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Task</h2>
              <button className="close-btn" onClick={closeDeleteModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Task:</strong> {taskToDelete.description}</p>
              <p className="warning-text">⚠️ This action cannot be undone. The task will be permanently deleted from TaskWarrior.</p>
              <p>Type <strong>deleteme</strong> to confirm deletion:</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type 'deleteme' to confirm"
                className="delete-confirm-input"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeDeleteModal}>Cancel</button>
              <button 
                className="delete-confirm-btn" 
                onClick={deleteTask}
                disabled={deleteConfirmText !== 'deleteme'}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {showCelebration && (
        <div className="celebration-overlay">
          <div className="trophy">🏆</div>
          <div className="confetti">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`confetti-piece confetti-${i % 4}`}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
