# 🚀 Space Launch Calendar

A sleek and responsive web app to explore upcoming rocket launches around the world. Built with **React**, **Vite**, and **Tailwind CSS**, it features a modern UI with an interactive calendar, mission details, and live countdown timers.

![image](https://github.com/user-attachments/assets/ee0411e0-f60c-49d2-a626-486516100362)

---

## ✨ Features

- 📅 **Calendar View** — Monthly and weekly layouts for upcoming space launches
- 🛰 **Mission Details** — Learn about each launch: rocket, provider, mission type, and location
- ⏱ **Countdown Timer** — Real-time countdowns to launch
- ⚡ **Live API Data** — Uses the Launch Library 2 API with performance caching
- 🌙 **Dark Mode** — Space-themed UI for astronomy fans
- 📱 **Responsive Design** — Optimized for mobile, tablet, and desktop

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Calendar Library:** FullCalendar
- **API:** [Launch Library 2 API](https://thespacedevs.com/llapi)
- **Other:** `react-countdown`, `react-router-dom`

---

## 🚀 Getting Started

### Requirements

- Node.js v14+
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/space-launch-calendar.git
cd space-launch-calendar
npm install
# or
yarn
```

### Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open http://localhost:5173 to view it in your browser.

## 📜 Scripts

| Command           | Description                 |
| ----------------- | --------------------------- |
| `npm run dev`     | Start development server    |
| `npm run build`   | Build app for production    |
| `npm run preview` | Preview production build    |
| `npm run lint`    | Run ESLint for code quality |

## 🌐 API Info

This app uses the Launch Library 2 API by The Space Devs. Note the API has rate limits; the app implements caching and fallback logic to handle those gracefully.

## 🚢 Deployment

You can deploy it on Vercel, Netlify, GitHub Pages, or any static host:

```bash
npm run build
```

Then upload the contents of the dist folder.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Submit a Pull Request

## 📄 License

Distributed under the MIT License. See LICENSE for details.

## 🙏 Credits

- The Space Devs for the Launch Library 2 API
- FullCalendar for the calendar interface
- React Countdown for launch timers

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by [The Space Devs](https://thespacedevs.com/)
- Calendar visualization powered by [FullCalendar](https://fullcalendar.io/)
