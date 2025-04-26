# VibePope - Holy Vibes Checker

A fun and respectful app that helps you explore Catholic Cardinals and rate your favorite potential future pope!

## 🚀 Live Demo

- **Client (React)**: [https://giolaq.github.io/vibepope](https://giolaq.github.io/vibepope)
- **API (Express)**: [https://vibepope-api.onrender.com/api/health](https://vibepope-api.onrender.com/api/health)

## 📋 Features

- Browse and search through Catholic Cardinals from around the world
- View detailed information about each cardinal
- Filter by country and sort by various criteria
- Responsive design for mobile and desktop

## 🛠️ Technologies

- **Frontend**: React, Material-UI, React Router
- **Backend**: Node.js, Express
- **Deployment**: GitHub Pages (frontend), Render (backend)

## 🏗️ Project Structure

```
vibepope/
├── client/              # React frontend
│   ├── public/          # Static files
│   └── src/             # Source code
│       ├── components/  # Reusable components
│       ├── pages/       # Application pages
│       └── services/    # API services
├── data/                # Data storage
│   ├── backup/          # Data backups
│   ├── enhanced/        # Enhanced data files
│   └── processed/       # Processed data files
└── server.js            # Express server
```

## 🚀 Deployment Instructions

### Backend (Render)

1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect to your GitHub repository
4. Configure build and start commands:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add environment variables:
   - `NODE_ENV`: `production`

### Frontend (GitHub Pages)

1. Update homepage in `client/package.json` with your GitHub username
2. Install GitHub Pages package:
   ```
   cd client
   npm install gh-pages --save-dev
   ```
3. Deploy to GitHub Pages:
   ```
   npm run deploy
   ```

## 🧑‍💻 Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd client
   npm install
   ```
3. Start development servers:
   ```
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Data sourced from the Vatican's official website
- This project is created for educational and entertainment purposes
- Special thanks to all cardinals for being such inspirational material 