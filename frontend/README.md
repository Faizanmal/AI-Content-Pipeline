#  React Frontend

This is the React.js frontend for the  AI Content Enhancement Pipeline.

## Features

- Professional blog-style layout
- Article list with filtering (Original/Enhanced)
- Article detail view with full content rendering
- References section for enhanced articles
- Responsive design
- Clean, modern typography

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

## Configuration

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`

Launches the test runner.

### `npm run build`

Builds the app for production to the `build` folder.

## Architecture

```
src/
├── components/
│   ├── Header/           # Navigation header
│   ├── ArticleCard/      # Article list item
│   ├── Loading/          # Loading spinner
│   └── ErrorMessage/     # Error display
├── pages/
│   ├── ArticleList/      # Main articles page
│   └── ArticleDetail/    # Single article view
├── services/
│   └── api.js            # Axios API client
├── App.js                # Main app with routing
└── App.css               # Global styles
```

## Pages

### Article List (`/`)

- Displays all articles in a responsive grid
- Filter by type: All, Original, Enhanced
- Pagination support
- Shows article badges (Original/Enhanced/Draft)

### Article Detail (`/articles/:id`)

- Full article content with HTML rendering
- Original/Enhanced article badges
- Links between original and enhanced versions
- References section for enhanced articles
- Source URL link

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
