const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all tasks
app.get('/api/tasks', (req, res) => {
  exec('task export', (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    
    try {
      const allTasks = stdout.trim() ? JSON.parse(stdout) : [];
      // Ensure each task has a proper status field
      const tasks = allTasks.map(task => ({
        ...task,
        status: task.status || 'pending' // Default to pending if status is missing
      }));
      res.json(tasks);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      res.status(500).json({ error: 'Failed to parse tasks' });
    }
  });
});

// Add new task
app.post('/api/tasks', (req, res) => {
  const { description, project, priority, tags } = req.body;
  
  let command = `task add "${description}"`;
  if (project) command += ` project:${project}`;
  if (priority) command += ` priority:${priority}`;
  if (tags && tags.length > 0) {
    tags.forEach(tag => {
      command += ` +${tag}`;
    });
  }
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to add task' });
    }
    res.json({ success: true, message: 'Task added successfully' });
  });
});

// Add annotation/note to task
app.post('/api/tasks/:id/annotate', (req, res) => {
  const taskId = req.params.id;
  const { note } = req.body;
  
  if (!note) {
    return res.status(400).json({ error: 'Note is required' });
  }
  
  exec(`task ${taskId} annotate "${note}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to add note' });
    }
    res.json({ success: true, message: 'Note added successfully' });
  });
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { description, project, priority, tags } = req.body;
  
  let command = `task ${taskId} modify`;
  if (description) command += ` "${description}"`;
  if (project) command += ` project:${project}`;
  if (priority) command += ` priority:${priority}`;
  
  // Remove all existing tags and add new ones
  if (tags) {
    // First, get current task to remove existing tags
    exec(`task ${taskId} export`, (error, stdout) => {
      if (!error && stdout.trim()) {
        try {
          const taskData = JSON.parse(stdout)[0];
          let modifyCommand = `task ${taskId} modify`;
          
          if (description) modifyCommand += ` "${description}"`;
          if (project) modifyCommand += ` project:${project}`;
          if (priority) modifyCommand += ` priority:${priority}`;
          
          // Remove existing tags
          if (taskData.tags) {
            taskData.tags.forEach(tag => {
              modifyCommand += ` -${tag}`;
            });
          }
          
          // Add new tags
          tags.forEach(tag => {
            modifyCommand += ` +${tag}`;
          });
          
          exec(modifyCommand, (error, stdout, stderr) => {
            if (error) {
              console.error('Error:', error);
              return res.status(500).json({ error: 'Failed to update task' });
            }
            res.json({ success: true, message: 'Task updated successfully' });
          });
        } catch (parseError) {
          res.status(500).json({ error: 'Failed to parse task data' });
        }
      } else {
        res.status(500).json({ error: 'Failed to get task data' });
      }
    });
  } else {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to update task' });
      }
      res.json({ success: true, message: 'Task updated successfully' });
    });
  }
});

// Complete task
app.post('/api/tasks/:id/complete', (req, res) => {
  const taskId = req.params.id;
  
  exec(`task ${taskId} done`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to complete task' });
    }
    res.json({ success: true, message: 'Task completed successfully' });
  });
});

// Reopen task
app.post('/api/tasks/:id/reopen', (req, res) => {
  const taskId = req.params.id;
  
  // Use uuid: prefix for completed tasks since they have id=0
  const command = taskId.includes('-') ? `task uuid:${taskId} modify status:pending` : `task ${taskId} modify status:pending`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to reopen task' });
    }
    res.json({ success: true, message: 'Task reopened successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`TaskWarrior API server running on http://localhost:${PORT}`);
});
