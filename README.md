# Terminal OS - Desktop Simulator

A web-based terminal OS simulation featuring a desktop-style environment with interactive icons, windows, and a terminal emulator. This application provides a nostalgic retro computing interface that's accessible across different devices.

## Features

- **Desktop Environment**: Interactive desktop with draggable icons
- **System Files**: Non-deletable system files (System, Documents, Buffer, Terminal)
- **Terminal Emulator**: Basic terminal functionality with command support
- **File Management**: Create, rename, and delete files and folders
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Theme Support**: Light and dark mode

## Technologies Used

- React (with TypeScript)
- TailwindCSS for styling
- Zustand for state management
- Express backend
- PostgreSQL for data persistence

## Screenshots

![Desktop Environment](attached_assets/screenshot-1743956788288.png)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/terminal-os.git
   cd terminal-os
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/terminal_os
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Docker Setup

1. Build the Docker image:
   ```bash
   docker build -t terminal-os .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 -e DATABASE_URL=postgresql://username:password@host.docker.internal:5432/terminal_os terminal-os
   ```

## Usage

- **Adding Items**: Right-click on the desktop and select "New Folder" or "New Document"
- **Managing Items**: Right-click on any user-created item to see options (Open, Rename, Delete)
- **Terminal**: Double-click on the Terminal icon to open a command-line interface
- **System Files**: The System, Documents, Buffer, and Terminal files cannot be deleted or renamed to ensure core functionality

## Deployment

This application can be deployed to any platform that supports Node.js applications:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by classic desktop operating systems
- Icon designs from [Lucide React](https://lucide.dev/)