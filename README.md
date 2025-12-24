# TaskWarrior UI

A modern, responsive web-based user interface for TaskWarrior with a REST API backend. Manage your tasks efficiently through a clean, intuitive web interface while leveraging the power of TaskWarrior's command-line functionality.

![TaskWarrior UI Screenshot](https://github.com/user-attachments/assets/86f97bd9-a3c7-4943-9afa-45628d749882)

## ✨ Features

- **Modern React Interface** - Clean, responsive design with real-time updates
- **Full Task Management** - Create, edit, complete, and reopen tasks
- **Project & Priority Support** - Organize tasks with projects and priorities
- **Tag Management** - Add and manage multiple tags per task
- **Task Annotations** - Add notes and comments to tasks
- **Search & Filter** - Find tasks quickly with built-in search
- **REST API** - Complete API for integration with other tools
- **Real-time Sync** - Changes reflect immediately in the UI
- **Mobile Responsive** - Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **TaskWarrior** installed and configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HusnainTaseer/taskwarrior-ui.git
   cd taskwarrior-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   # Start both API server and React app
   npm run dev
   
   # Or start them separately:
   # Terminal 1: Start API server
   npm run server
   
   # Terminal 2: Start React app
   npm start
   ```

4. **Open your browser**
   - Web UI: http://localhost:3000
   - API Server: http://localhost:3001

## 📋 TaskWarrior Installation & Setup

### macOS Installation

```bash
# Using Homebrew
brew install task

# Using MacPorts
sudo port install taskwarrior
```

### Linux Installation

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install taskwarrior
```

**CentOS/RHEL/Fedora:**
```bash
# CentOS/RHEL
sudo yum install task

# Fedora
sudo dnf install task
```

**Arch Linux:**
```bash
sudo pacman -S task
```

### Initial TaskWarrior Configuration

1. **Initialize TaskWarrior**
   ```bash
   task
   ```
   This creates the initial configuration and data directory.

2. **Basic Configuration (Optional)**
   ```bash
   # Set your preferred date format
   task config dateformat Y-M-D
   
   # Set default priority
   task config default.priority M
   
   # Enable color output
   task config color on
   ```

3. **Verify Installation**
   ```bash
   task version
   task add "Test task"
   task list
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
# API Server Port (default: 3001)
PORT=3001

# TaskWarrior data directory (optional)
TASKDATA=/path/to/your/taskwarrior/data
```

### TaskWarrior Configuration

The application uses your default TaskWarrior configuration. You can customize:

```bash
# View current configuration
task show

# Set custom data location
task config data.location /path/to/taskdata

# Configure urgency coefficients
task config urgency.priority.coefficient 6.0
task config urgency.project.coefficient 1.0
```

## 🛠️ Development

### Project Structure

```
taskwarrior-ui/
├── public/                 # Static files
├── src/                   # React source code
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
├── server.js             # Express API server
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

### Available Scripts

- `npm start` - Start React development server (port 3000)
- `npm run server` - Start API server only (port 3001)
- `npm run dev` - Start both servers concurrently
- `npm run build` - Build production React app
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| POST | `/api/tasks/:id/complete` | Mark task as complete |
| POST | `/api/tasks/:id/reopen` | Reopen completed task |
| POST | `/api/tasks/:id/annotate` | Add annotation to task |

### Example API Usage

```javascript
// Create a new task
fetch('http://localhost:3001/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Complete project documentation',
    project: 'work',
    priority: 'H',
    tags: ['documentation', 'urgent']
  })
});

// Get all tasks
fetch('http://localhost:3001/api/tasks')
  .then(response => response.json())
  .then(tasks => console.log(tasks));
```

## 🐛 Troubleshooting

### Common Issues

**TaskWarrior not found:**
```bash
# Check if TaskWarrior is installed
which task

# Check TaskWarrior version
task version
```

**Permission errors:**
```bash
# Check TaskWarrior data directory permissions
ls -la ~/.task/

# Fix permissions if needed
chmod 755 ~/.task/
```

**API server won't start:**
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill process using the port
kill -9 $(lsof -t -i:3001)
```

**Tasks not showing:**
```bash
# Verify TaskWarrior has tasks
task list

# Check TaskWarrior export format
task export
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Husnain Taseer**
- GitHub: [@HusnainTaseer](https://github.com/HusnainTaseer)
- Email: husnain.taseer@example.com

## 🙏 Acknowledgments

- [TaskWarrior](https://taskwarrior.org/) - The powerful command-line task management tool
- [React](https://reactjs.org/) - The web framework used
- [Express.js](https://expressjs.com/) - The API server framework
- [Lucide React](https://lucide.dev/) - Beautiful icons

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/HusnainTaseer/taskwarrior-ui?style=social)
![GitHub forks](https://img.shields.io/github/forks/HusnainTaseer/taskwarrior-ui?style=social)
![GitHub issues](https://img.shields.io/github/issues/HusnainTaseer/taskwarrior-ui)
![GitHub license](https://img.shields.io/github/license/HusnainTaseer/taskwarrior-ui)

---

⭐ **Star this repository if you find it helpful!**
