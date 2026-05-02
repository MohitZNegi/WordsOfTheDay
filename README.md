# 📚 Words of the Day

A Chrome extension to capture and learn new words while browsing.

## ✨ Features

- **Highlight & Save**: Right-click any word to save with auto-fetched definition
- **Organize by Date**: Words grouped by the day you learned them
- **Dashboard**: List and Calendar views to browse your words
- **Quiz Mode**: Test yourself with multiple-choice questions
- **Local Storage**: All data saved locally using chrome.storage.local

## 🔧 Tech Stack

- **JavaScript** (Vanilla) - Core logic
- **HTML5** - UI structure
- **CSS3** - Modern styling with CSS variables
- **Chrome APIs** - contextMenus, storage, messaging
- **Dictionary API** - Free API for word definitions

## 🚀 Quick Start

### Installation

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the project folder
5. Done! ✅

### How to Use

**Saving Words:**

- Highlight any word on a webpage
- Right-click → "Save Word"
- Word is automatically saved with today's date

**Viewing Words:**

- Click the extension icon
- Browse by **List** (dates) or **Calendar** (visual)
- Click any word to see details (definition, type, example)

**Quiz Mode:**

- Click **🎯 Quiz** button
- Answer multiple-choice questions
- See your score percentage

**Managing:**

- Delete single word: Open word details → 🗑️ Delete
- Delete entire date: Click Delete next to the date

## 📁 File Structure

```
├── manifest.json       # Extension config
├── background.js       # Service worker (API, storage)
├── content.js          # Page notifications
├── popup.html          # Dashboard UI
├── popup.js            # Dashboard logic
├── styles.css          # Modern theme
├── icons/              # Extension icons
└── README.md           # This file
```

## 🎨 Design

- Modern Indigo theme (#6366f1) with smooth gradients
- Responsive popup (480px width)
- Clean, minimal UI with smooth transitions
- Dark mode ready

## 📝 Data Format

```javascript
{
  "2026-05-02": [
    {
      word: "ephemeral",
      definition: "lasting for a very short time",
      meaning: "adjective",
      example: "The beauty of cherry blossoms is ephemeral.",
      savedAt: "2026-05-02T10:30:00.000Z"
    }
  ]
}
```

## 🛠️ Development

Built with minimal dependencies - just vanilla JavaScript and Chrome APIs. No build tools or frameworks needed!

---

**Start learning new words today!** 🎯
