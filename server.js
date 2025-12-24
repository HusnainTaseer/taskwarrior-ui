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
  const { description, fullDescription, project, priority, tags } = req.body;
  
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
    
    // If there's a full description, add it as an annotation
    if (fullDescription && fullDescription.trim()) {
      // Extract task ID from stdout (TaskWarrior outputs "Created task X.")
      const match = stdout.match(/Created task (\d+)/);
      if (match) {
        const taskId = match[1];
        exec(`task ${taskId} annotate "${fullDescription}"`, (annotateError) => {
          if (annotateError) {
            console.error('Error adding annotation:', annotateError);
          }
          res.json({ success: true, message: 'Task added successfully' });
        });
      } else {
        res.json({ success: true, message: 'Task added successfully' });
      }
    } else {
      res.json({ success: true, message: 'Task added successfully' });
    }
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
  const { description, project, priority, tags, status } = req.body;
  
  console.log('Update request for task:', taskId, 'with data:', req.body);
  
  // Handle status change separately for blocking/unblocking
  if (status === 'waiting') {
    exec(`task ${taskId} modify wait:someday`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error blocking task:', error);
        return res.status(500).json({ error: 'Failed to block task' });
      }
      res.json({ success: true, message: 'Task blocked successfully' });
    });
    return;
  }
  
  let command = `task ${taskId} modify`;
  if (description) command += ` "${description}"`;
  if (project) command += ` project:${project}`;
  if (priority) command += ` priority:${priority}`;
  
  console.log('Command to execute:', command);
  
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
          if (status) modifyCommand += ` status:${status}`;
          
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

// Reopen task (works for both completed and blocked tasks)
app.post('/api/tasks/:id/reopen', (req, res) => {
  const taskId = req.params.id;
  
  console.log('Reopen request for task:', taskId);
  
  // Use uuid: prefix if it looks like a UUID
  const taskIdentifier = taskId.includes('-') ? `uuid:${taskId}` : taskId;
  
  console.log('Using task identifier:', taskIdentifier);
  
  // First check the task status
  exec(`task ${taskIdentifier} info`, (infoError, infoStdout, infoStderr) => {
    console.log('Task info:', infoStdout);
    
    // Try multiple approaches to reopen the task
    if (infoStdout.includes('Status        Completed')) {
      // For completed tasks, set status to pending
      exec(`task ${taskIdentifier} modify status:pending`, (error, stdout, stderr) => {
        console.log('Set status pending - stdout:', stdout, 'stderr:', stderr);
        res.json({ success: true, message: 'Task reopened successfully' });
      });
    } else if (infoStdout.includes('wait')) {
      // For blocked tasks, remove wait field
      exec(`task ${taskIdentifier} modify wait:`, (error, stdout, stderr) => {
        console.log('Remove wait - stdout:', stdout, 'stderr:', stderr);
        res.json({ success: true, message: 'Task unblocked successfully' });
      });
    } else {
      // Default approach
      exec(`task ${taskIdentifier} modify status:pending wait:`, (error, stdout, stderr) => {
        console.log('Default modify - stdout:', stdout, 'stderr:', stderr);
        res.json({ success: true, message: 'Task reopened successfully' });
      });
    }
  });
});

// Archive task
app.post('/api/tasks/:id/archive', (req, res) => {
  const taskId = req.params.id;
  const taskIdentifier = taskId.includes('-') ? `uuid:${taskId}` : taskId;
  
  exec(`task ${taskIdentifier} modify +archived`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error archiving task:', error);
      return res.status(500).json({ error: 'Failed to archive task' });
    }
    res.json({ success: true, message: 'Task archived successfully' });
  });
});

// Unarchive task
app.post('/api/tasks/:id/unarchive', (req, res) => {
  const taskId = req.params.id;
  const taskIdentifier = taskId.includes('-') ? `uuid:${taskId}` : taskId;
  
  exec(`task ${taskIdentifier} modify -archived`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error unarchiving task:', error);
      return res.status(500).json({ error: 'Failed to unarchive task' });
    }
    res.json({ success: true, message: 'Task unarchived successfully' });
  });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  
  console.log('Delete request for task:', taskId);
  
  // Use uuid: prefix if it looks like a UUID
  const taskIdentifier = taskId.includes('-') ? `uuid:${taskId}` : taskId;
  
  // TaskWarrior delete command with confirmation bypass
  exec(`echo 'yes' | task ${taskIdentifier} delete`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    console.log('Task deleted successfully:', stdout);
    res.json({ success: true, message: 'Task deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`TaskWarrior API server running on http://localhost:${PORT}`);
});
