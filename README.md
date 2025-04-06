# 👾 VirOS - A little bit of me...

<div align="center">
  <img src="attached_assets/ss.png" alt="VirOS Screenshot" width="700px" />
  <p><em>A nostalgic journey back to classic desktop computing</em></p>
</div>

<div align="center">
  <a href="#-features">Features</a> •
  <a href="#-technologies">Technologies</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-license">License</a>
</div>

<div align="center">
  <img src="https://img.shields.io/github/stars/tech9ic/viros?style=for-the-badge" alt="Stars" />
  <img src="https://img.shields.io/github/forks/tech9ic/viros?style=for-the-badge" alt="Forks" />
  <img src="https://img.shields.io/github/issues/tech9ic/viros?style=for-the-badge" alt="Issues" />
  <img src="https://img.shields.io/github/license/tech9ic/viros?style=for-the-badge" alt="License" />
</div>

---

## 🌟 Overview

VirOS (formerly VirOS) is a modern web-based simulation of classic desktop operating systems. It features an interactive desktop environment with draggable icons, windowing system, and terminal emulation - all accessible from any device with a web browser.

The application offers a nostalgic computing experience combined with modern web technologies to create a unique interface that works seamlessly across desktop and mobile devices.

## ✨ Features

- **🖥️ Desktop Environment**: Fully interactive desktop with draggable icons and window management
- **🛡️ System Files**: Protected system files (System, Projects, Buffer, Terminal, bibhu.exe) that cannot be deleted or renamed
- **💻 Terminal Emulator**: Functional terminal with command support
- **📁 File Management**: Create, rename, delete, and organize files and folders
- **📱 Responsive Design**: Optimized for all device sizes - desktop, tablet and mobile
- **🌓 Theme Support**: Toggle between light and dark modes
- **☁️ Cloud Storage**: Persistent state with browser localStorage (settings and files)

## 🔧 Technologies

<div align="center">
  <table>
    <tr>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
        <br>React
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
        <br>TypeScript
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="TailwindCSS" />
        <br>TailwindCSS
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=express" width="48" height="48" alt="Express" />
        <br>Express
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=postgres" width="48" height="48" alt="PostgreSQL" />
        <br>PostgreSQL
      </td>
    </tr>
  </table>
</div>

- **State Management**: Zustand for global state with persistence
- **UI Components**: Custom-built Windows and Desktop components
- **DnD**: React DnD for drag-and-drop functionality
- **API**: RESTful API for data operations

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/VirOS.git
   cd viros
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file with your database connection:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/VirOS
   ```

4. **Set up the database**

   ```bash
   npm run db:push
   ```

5. **Launch the development server**

   ```bash
   npm run dev
   ```

6. **Open in browser**

   Navigate to `http://localhost:3000`

### 🐳 Docker Setup

We provide Docker support for easy deployment:

1. **Build the image**

   ```bash
   docker build -t viros .
   ```

2. **Run the container**

   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL=postgresql://username:password@host.docker.internal:5432/viros \
     viros
   ```

## 🔍 Usage

### Desktop Controls

| Action                       | Description                                   |
| ---------------------------- | --------------------------------------------- |
| **Left-click**               | Select item                                   |
| **Double-click**             | Open item                                     |
| **Right-click** (on desktop) | Show desktop context menu                     |
| **Right-click** (on item)    | Show item context menu (open, rename, delete) |
| **Drag**                     | Move items around the desktop                 |
| **Drag to Buffer**           | Move item to the Buffer                       |

### System Files

The following system files cannot be deleted or renamed:

- **System**: View system information
- **Projects**: Store and organize your files
- **Terminal**: Access command-line interface
- **Buffer**: Temporary storage for deleted items (like Recycle Bin/Trash)
- **bibhu.exe**: View developer portfolio and information

### Terminal Commands

- `help` - Show available commands
- `echo [text]` - Display text
- `date` - Show current date/time
- `clear` - Clear the terminal
- `ls` - List files
- `whoami` - Show current user
- `neofetch` - Display system information
- `uname` - Display OS name
- `cowsay [message]` - Display a cow saying your message
- `fortune` - Get a random fortune message
- `ping [address]` - Simulate pinging an address
- `clear` - Clear the terminal
- `ls` - List files
- `whoami` - Show current user

## 🚀 Deployment

### Standard Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start the production server**

   ```bash
   npm start
   ```

### Deployment Platforms

VirOS can be deployed to any platform that supports Node.js:

- **Heroku**: Easy deployment with PostgreSQL add-on
- **Vercel**: Great for frontend with serverless functions for the backend
- **AWS/GCP/Azure**: For more scalable enterprise deployment
- **DigitalOcean**: Simple deployment with App Platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by classic desktop operating systems like Windows 95/98 and early MacOS
- Icon designs from [Lucide React](https://lucide.dev/)
- Built with modern web technologies while honoring the nostalgia of classic interfaces

---

<div align="center">
  <p>Made with ❤️ by tech9ic</p>
  <p>© 2025 VirOS Project</p>
</div>
