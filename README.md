<a name="readme-top"></a>

<div align="center">
  <img src="./docs/static/img/logo.png" alt="Logo" width="200">
  <h1 align="center">OpenHands: Code Less, Make More</h1>
</div>


<div align="center">
  <a href="https://github.com/All-Hands-AI/OpenHands/graphs/contributors"><img src="https://img.shields.io/github/contributors/All-Hands-AI/OpenHands?style=for-the-badge&color=blue" alt="Contributors"></a>
  <a href="https://github.com/All-Hands-AI/OpenHands/stargazers"><img src="https://img.shields.io/github/stars/All-Hands-AI/OpenHands?style=for-the-badge&color=blue" alt="Stargazers"></a>
  <a href="https://github.com/All-Hands-AI/OpenHands/blob/main/LICENSE"><img src="https://img.shields.io/github/license/All-Hands-AI/OpenHands?style=for-the-badge&color=blue" alt="MIT License"></a>
  <br/>
  <a href="https://join.slack.com/t/openhands-ai/shared_invite/zt-3847of6xi-xuYJIPa6YIPg4ElbDWbtSA"><img src="https://img.shields.io/badge/Slack-Join%20Us-red?logo=slack&logoColor=white&style=for-the-badge" alt="Join our Slack community"></a>
  <a href="https://discord.gg/ESHStjSjD4"><img src="https://img.shields.io/badge/Discord-Join%20Us-purple?logo=discord&logoColor=white&style=for-the-badge" alt="Join our Discord community"></a>
  <a href="https://github.com/All-Hands-AI/OpenHands/blob/main/CREDITS.md"><img src="https://img.shields.io/badge/Project-Credits-blue?style=for-the-badge&color=FFE165&logo=github&logoColor=white" alt="Credits"></a>
  <br/>
  <a href="https://docs.all-hands.dev/usage/getting-started"><img src="https://img.shields.io/badge/Documentation-000?logo=googledocs&logoColor=FFE165&style=for-the-badge" alt="Check out the documentation"></a>
  <a href="https://arxiv.org/abs/2407.16741"><img src="https://img.shields.io/badge/Paper%20on%20Arxiv-000?logoColor=FFE165&logo=arxiv&style=for-the-badge" alt="Paper on Arxiv"></a>
  <a href="https://docs.google.com/spreadsheets/d/1wOUdFCMyY6Nt0AIqF705KN4JKOWgeI4wUGUP60krXXs/edit?gid=0#gid=0"><img src="https://img.shields.io/badge/Benchmark%20score-000?logoColor=FFE165&logo=huggingface&style=for-the-badge" alt="Evaluation Benchmark Score"></a>

  <!-- Keep these links. Translations will automatically update with the README. -->
  <a href="https://www.readme-i18n.com/All-Hands-AI/OpenHands?lang=de">Deutsch</a> |
  <a href="https://www.readme-i18n.com/All-Hands-AI/OpenHands?lang=es">Español</a> |
  <a href="https://www.readme-i18n.com/All-Hands-AI/OpenHands?lang=fr">français</a> |
  <a href="https://www.readme-i18n.com/All-Hands-AI/OpenHands?lang=ja">日本語</a> |
  <a href="https://www.readme-i18n.com/All-Hands-AI/OpenHands?lang=ko">한국어</a> |
  <a href="https://www.readme-i18n.com/All-Hands-AI/OpenHands?lang=pt">Português</a> |
  <a href="https://www.readme-i18n.com/All-Hands-AI/OpenHands?lang=ru">Русский</a> |
  <a href="https://www.readme-i18n.com/All-Hands-AI/OpenHands?lang=zh">中文</a>

  <hr>
</div>

Welcome to OpenHands (formerly OpenDevin), a platform for software development agents powered by AI.

OpenHands agents can do anything a human developer can: modify code, run commands, browse the web,
call APIs, and yes—even copy code snippets from StackOverflow.

Learn more at [docs.all-hands.dev](https://docs.all-hands.dev), or [sign up for OpenHands Cloud](https://app.all-hands.dev) to get started.

> [!IMPORTANT]
> Using OpenHands for work? We'd love to chat! Fill out
> [this short form](https://docs.google.com/forms/d/e/1FAIpQLSet3VbGaz8z32gW9Wm-Grl4jpt5WgMXPgJ4EDPVmCETCBpJtQ/viewform)
> to join our Design Partner program, where you'll get early access to commercial features and the opportunity to provide input on our product roadmap.

![App screenshot](./docs/static/img/screenshot.png)

## ☁️ OpenHands Cloud
The easiest way to get started with OpenHands is on [OpenHands Cloud](https://app.all-hands.dev),
which comes with $20 in free credits for new users.

## 💻 Running OpenHands Locally

OpenHands can also run on your local system using Docker.
See the [Running OpenHands](https://docs.all-hands.dev/usage/installation) guide for
system requirements and more information.

> [!WARNING]
> On a public network? See our [Hardened Docker Installation Guide](https://docs.all-hands.dev/usage/runtimes/docker#hardened-docker-installation)
> to secure your deployment by restricting network binding and implementing additional security measures.


```bash
docker pull docker.all-hands.dev/all-hands-ai/runtime:0.48-nikolaik

docker run -it --rm --pull=always \
    -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.48-nikolaik \
    -e LOG_ALL_EVENTS=true \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v ~/.openhands:/.openhands \
    -p 3000:3000 \
    --add-host host.docker.internal:host-gateway \
    --name openhands-app \
    docker.all-hands.dev/all-hands-ai/openhands:0.48
```

> **Note**: If you used OpenHands before version 0.44, you may want to run `mv ~/.openhands-state ~/.openhands` to migrate your conversation history to the new location.

You'll find OpenHands running at [http://localhost:3000](http://localhost:3000)!

When you open the application, you'll be asked to choose an LLM provider and add an API key.
[Anthropic's Claude Sonnet 4](https://www.anthropic.com/api) (`anthropic/claude-sonnet-4-20250514`)
works best, but you have [many options](https://docs.all-hands.dev/usage/llms).

## 💡 Other ways to run OpenHands

> [!WARNING]
> OpenHands is meant to be run by a single user on their local workstation.
> It is not appropriate for multi-tenant deployments where multiple users share the same instance. There is no built-in authentication, isolation, or scalability.
>
> If you're interested in running OpenHands in a multi-tenant environment, check out the source-available, commercially-licensed
> [OpenHands Cloud Helm Chart](https://github.com/all-Hands-AI/OpenHands-cloud)

You can [connect OpenHands to your local filesystem](https://docs.all-hands.dev/usage/runtimes/docker#connecting-to-your-filesystem),
run OpenHands in a scriptable [headless mode](https://docs.all-hands.dev/usage/how-to/headless-mode),
interact with it via a [friendly CLI](https://docs.all-hands.dev/usage/how-to/cli-mode),
or run it on tagged issues with [a github action](https://docs.all-hands.dev/usage/how-to/github-action).

Visit [Running OpenHands](https://docs.all-hands.dev/usage/installation) for more information and setup instructions.

If you want to modify the OpenHands source code, check out [Development.md](https://github.com/All-Hands-AI/OpenHands/blob/main/Development.md).

Having issues? The [Troubleshooting Guide](https://docs.all-hands.dev/usage/troubleshooting) can help.

## 📖 Documentation
  <a href="https://deepwiki.com/All-Hands-AI/OpenHands"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" title="Autogenerated Documentation by DeepWiki"></a>

To learn more about the project, and for tips on using OpenHands,
check out our [documentation](https://docs.all-hands.dev/usage/getting-started).

There you'll find resources on how to use different LLM providers,
troubleshooting resources, and advanced configuration options.

## 🤝 How to Join the Community

OpenHands is a community-driven project, and we welcome contributions from everyone. We do most of our communication
through Slack, so this is the best place to start, but we also are happy to have you contact us on Discord or Github:

- [Join our Slack workspace](https://join.slack.com/t/openhands-ai/shared_invite/zt-3847of6xi-xuYJIPa6YIPg4ElbDWbtSA) - Here we talk about research, architecture, and future development.
- [Join our Discord server](https://discord.gg/ESHStjSjD4) - This is a community-run server for general discussion, questions, and feedback.
- [Read or post Github Issues](https://github.com/All-Hands-AI/OpenHands/issues) - Check out the issues we're working on, or add your own ideas.

See more about the community in [COMMUNITY.md](./COMMUNITY.md) or find details on contributing in [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📈 Progress

See the monthly OpenHands roadmap [here](https://github.com/orgs/All-Hands-AI/projects/1) (updated at the maintainer's meeting at the end of each month).

<p align="center">
  <a href="https://star-history.com/#All-Hands-AI/OpenHands&Date">
    <img src="https://api.star-history.com/svg?repos=All-Hands-AI/OpenHands&type=Date" width="500" alt="Star History Chart">
  </a>
</p>

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

## 🙏 Acknowledgements

OpenHands is built by a large number of contributors, and every contribution is greatly appreciated! We also build upon other open source projects, and we are deeply thankful for their work.

For a list of open source projects and licenses used in OpenHands, please see our [CREDITS.md](./CREDITS.md) file.

## 📚 Cite

```
@inproceedings{
  wang2025openhands,
  title={OpenHands: An Open Platform for {AI} Software Developers as Generalist Agents},
  author={Xingyao Wang and Boxuan Li and Yufan Song and Frank F. Xu and Xiangru Tang and Mingchen Zhuge and Jiayi Pan and Yueqi Song and Bowen Li and Jaskirat Singh and Hoang H. Tran and Fuqiang Li and Ren Ma and Mingzhang Zheng and Bill Qian and Yanjun Shao and Niklas Muennighoff and Yizhe Zhang and Binyuan Hui and Junyang Lin and Robert Brennan and Hao Peng and Heng Ji and Graham Neubig},
  booktitle={The Thirteenth International Conference on Learning Representations},
  year={2025},
  url={https://openreview.net/forum?id=OJd3ayDDoF}
}
```

# 🚀 TRINITI MVP - AI Development Platform

A comprehensive AI-driven development platform with task execution, memory management, and unified API integration.

## 🎯 Overview

TRINITI MVP is a full-stack development platform that combines:
- **Task Execution Engine** - Execute and simulate various development tasks
- **Memory System** - Persistent storage and retrieval of task history
- **Unified API** - Seamless frontend-backend integration
- **Modern UI** - Real-time feedback and comprehensive analytics

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Memory        │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   System        │
│                 │    │                 │    │                 │
│ • Task Runner   │    │ • Task Executor │    │ • Persistence   │
│ • Real-time UI  │    │ • API Endpoints │    │ • Search Engine │
│ • Analytics     │    │ • CORS Support  │    │ • Statistics    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and **npm**
- **Python** 3.8+ and **pip**
- **PowerShell** (for Windows development script)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd triniti_primal_mvp
```

### 2. Start Development Environment

**Windows (Recommended):**
```powershell
.\scripts\dev-up.ps1
```

**Manual Setup:**
```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install fastapi uvicorn

# Frontend
cd frontend
npm install
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## 🎯 Features

### ✅ Task Execution
- **Real-time task simulation** with multiple operation types
- **Comprehensive error handling** with detailed feedback
- **Execution time tracking** and performance metrics
- **Task history** with search and filtering capabilities

### ✅ Memory System
- **Persistent storage** of task executions
- **Advanced search** with similarity matching
- **Pattern recognition** and analytics
- **Data import/export** capabilities

### ✅ API Integration
- **RESTful API** with proper HTTP status codes
- **CORS support** for cross-origin requests
- **Health checks** and status monitoring
- **Type-safe interfaces** with TypeScript

### ✅ Modern UI
- **Responsive design** with Tailwind CSS
- **Real-time updates** and loading states
- **Comprehensive analytics** dashboard
- **Error handling** with user-friendly messages

## 📁 Project Structure

```
triniti_primal_mvp/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── task_runner.py      # Task execution API
│   │   └── main.py                 # FastAPI application
│   └── backend_server.py           # Main backend server
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── taskRunner.ts       # API client
│   │   ├── components/
│   │   │   ├── TaskRunnerComponent.tsx
│   │   │   └── UnifiedTaskRunner.tsx
│   │   ├── examples/
│   │   │   ├── TaskRunnerDemo.tsx
│   │   │   └── UnifiedTaskRunnerDemo.tsx
│   │   ├── hooks/
│   │   │   └── useTaskRunner.ts    # React hooks
│   │   ├── services/
│   │   │   └── TRINITIMemorySystem.ts
│   │   └── types/
│   │       └── task.ts             # TypeScript interfaces
│   └── package.json
├── scripts/
│   └── dev-up.ps1                  # Development launcher
└── README.md
```

## 🌐 API Endpoints

### Task Execution
- `POST /api/execute` - Execute a task command
- `GET /api/tasks` - Get task execution history
- `GET /api/tasks/stats` - Get task execution statistics
- `DELETE /api/tasks` - Clear task history

### System Status
- `GET /api/health` - Check API health status
- `GET /api/status` - Get API status information

### Example Usage

```typescript
// Execute a task
const result = await runTask({
  command: "Hello, how are you?",
  metadata: { source: "demo" }
});

// Get task history
const history = await getTaskHistory(50, 0);

// Get statistics
const stats = await getTaskStatistics();
```

## 🎨 UI Components

### TaskRunnerComponent
Basic task execution component with:
- Task input form
- Real-time result display
- Task history
- Statistics dashboard

### UnifiedTaskRunner
Advanced component with:
- API integration
- Health monitoring
- Error handling
- Comprehensive analytics

### Demo Components
- **TaskRunnerDemo** - Showcases basic functionality
- **UnifiedTaskRunnerDemo** - Complete system demonstration

## 🧠 Memory System

The TRINITI Memory System provides:
- **Persistent storage** of task executions
- **Advanced search** with similarity matching
- **Pattern recognition** for task analysis
- **Statistics and analytics** for performance insights

### Features
- Automatic task recording
- Intelligent search and filtering
- Data import/export capabilities
- Performance optimization

## 🔧 Development

### Backend Development
```bash
cd backend
python -m uvicorn app.main:app --reload --port 3000
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Type Checking
```bash
cd frontend
npx tsc --noEmit
```

### Building for Production
```bash
cd frontend
npm run build
```

## 🚀 Deployment

### Backend Deployment
```bash
# Install dependencies
pip install -r requirements.txt

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 3000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npx serve -s build -l 3001
```

## 📊 Monitoring

### Health Checks
- Backend health: `GET /api/health`
- API status: `GET /api/status`
- Task statistics: `GET /api/tasks/stats`

### Logging
- Backend logs are displayed in the terminal
- Frontend logs are available in browser console
- API requests are logged with timestamps

## 🛠️ Configuration

### Environment Variables
```bash
# Frontend
REACT_APP_API_URL=http://localhost:3000

# Backend
API_HOST=0.0.0.0
API_PORT=3000
CORS_ORIGINS=http://localhost:3001
```

### API Configuration
```typescript
const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  retryCount: 3,
  enableLogging: true
};
```

## 🎯 Example Tasks

### Communication
- `Hello, how are you today?`
- `What's the weather like?`

### File Operations
- `Create a new file called test.txt`
- `List files in the current directory`
- `Search for files containing "react"`

### Code Operations
- `Generate a React component`
- `Create a TypeScript interface`
- `Search for functions in the codebase`

### Version Control
- `Git commit with message "Update task runner"`
- `Show git status`
- `List git branches`

## 🔍 Troubleshooting

### Common Issues

**Backend not starting:**
- Check Python version (3.8+ required)
- Verify virtual environment is activated
- Check port 3000 is available

**Frontend not connecting:**
- Verify backend is running on port 3000
- Check CORS configuration
- Review browser console for errors

**API errors:**
- Check API health endpoint
- Verify network connectivity
- Review backend logs

### Debug Mode
```bash
# Backend with debug logging
uvicorn app.main:app --reload --log-level debug

# Frontend with verbose logging
npm run dev -- --verbose
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- **FastAPI** for the backend framework
- **React** for the frontend framework
- **Tailwind CSS** for styling
- **TypeScript** for type safety

---

**🚀 Ready to build the future of AI-driven development!**
