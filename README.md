# Notion Clone Project

A beautiful Notion-inspired workspace built with HTML, CSS, and JavaScript. This project includes a multi-page static site and an advanced Notion clone app in the `startpage/notion-bolt` directory.

## Features

- Modern, responsive UI inspired by Notion
- Sidebar navigation with Home, Inbox, Private, Teamspaces, Templates, Trash, and Settings
- Create, edit, delete, and favorite pages
- Search functionality
- Light/dark themes and adjustable font size
- Sticky notes, page export, and sharing options
- Invite members and manage notifications
- No backend: all data is stored in the browser (localStorage)

## Project Structure

```
/ (root)
├── index.html                # Main landing page
├── styles.css                # Main styles
├── script.js                 # Header navigation logic
├── [other HTML pages]        # login, calendar, mail, ai, enterprise, pricing, etc.
├── assets/                   # Images, icons, videos
├── startpage/
│   └── notion-bolt/          # Advanced Notion clone app
│       ├── index.html
│       ├── styles.css
│       ├── script.js
│       ├── package.json
│       └── ...
```

## Getting Started

### Main Project
Just open `index.html` in your browser to explore the landing page and navigation.

### Advanced Notion Clone (`startpage/notion-bolt`)
1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Open a terminal and navigate to `startpage/notion-bolt`:
   ```sh
   cd startpage/notion-bolt
   npm install
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts (in `startpage/notion-bolt`)
- `npm start` or `npm run dev`: Start a local server for development
- No build step required (static site)

## Dependencies
- [serve](https://www.npmjs.com/package/serve) (for local development only)

## License
MIT

---

**Enjoy your Notion clone!** 