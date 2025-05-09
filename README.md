# Space Launch Calendar

A modern web application for tracking and visualizing upcoming space launches worldwide. Built with React, Vite, and Tailwind CSS.

![Space Launch Calendar](https://via.placeholder.com/1200x630?text=Space+Launch+Calendar)

## Features

- **Interactive Calendar**: View upcoming rocket launches in a monthly or weekly calendar format
- **Launch Details**: Get comprehensive information about each mission including:
  - Launch provider and rocket details
  - Mission objectives
  - Launch location and timing
  - Countdown timers
- **Real-time Updates**: Data is fetched from the Launch Library 2 API with caching for optimal performance
- **Responsive Design**: Works seamlessly across mobile, tablet, and desktop devices
- **Dark Theme**: Space-themed dark UI optimized for astronomy enthusiasts

## Technology Stack

- **Frontend**: React 18 with React Router for navigation
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for responsive design
- **Calendar**: FullCalendar with day grid plugin
- **API Integration**: Launch Library 2 API by The Space Devs
- **Additional Libraries**:
  - react-countdown for launch timers
  - react-router-dom for navigation

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/space-launch-calendar.git
   cd space-launch-calendar
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code quality issues

## API Usage

This project uses the [Launch Library 2 API](https://thespacedevs.com/llapi) provided by The Space Devs. The API has rate limits, and the application includes fallback mechanisms and caching strategies to handle this gracefully.

## Deployment

The application can be deployed to any static hosting service:

1. Build the project

   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your hosting provider

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by [The Space Devs](https://thespacedevs.com/)
- Calendar visualization powered by [FullCalendar](https://fullcalendar.io/)
