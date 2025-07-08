# ToDoWithCal

A modern, Apple-inspired To-Do and Calendar app with a beautiful UI, inline editing, day timeline, and daily motivation.

## Features
- 📅 **Calendar View** with inline event editing and validation
- 📝 **To-Do List** with status, priority, and recurrence
- 🕒 **Day Timeline**: visualizes your day as a timeline
- 💡 **Motivation Section**: fetches daily motivational quotes and action plans (OpenAI API)
- ⚡ **Real-time UI updates** after all actions
- 🎨 **Material-UI v5** design, Apple-level polish

## Tech Stack
- **Frontend:** React 18, Material-UI v5, react-big-calendar, date-fns
- **Backend:** Node.js, Express, SQLite

## Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/yourusername/ToDoWithCal.git
   cd ToDoWithCal
   ```
2. **Install dependencies:**
   ```sh
   cd client && npm install
   cd ../server && npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in `client/` and `server/` as needed.
   - **Never commit your OpenAI API key or secrets!**
4. **Start the app:**
   - Start backend: `cd server && npm start`
   - Start frontend: `cd client && npm start`

## Motivation Section (OpenAI API)
- To use the Motivation feature, set your OpenAI API key in an environment variable or config file (never commit secrets to GitHub).

## Security
- **Never commit your API keys, .env files, or database files.**
- See `.gitignore` for excluded files.

## License
MIT
