# Stegno React Secure Chat

## Introduction

This repository contains a React-based web application called **Stegno**. The app is a proof-of-concept secure chat/meeting platform that tries to keep messages confidential. It was built with Create React App and uses client-side logic (in `src/utils`) to demonstrate basic steganography and encryption ideas.

---

## Getting Started 🎯

Follow these steps to run the project from scratch:

### Prerequisites

- Node.js (v14 or newer) and npm installed

### Installation and Development

```bash
# clone the repo
git clone <your-repo-url> stegno-react
cd stegno-react

# install dependencies
npm install

# start the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically reload when you make edits.

### Build for Production

```bash
npm run build
```

The optimized output will be placed in the `build/` directory.

---

## Why This Project Was Created 💡

The idea for Stegno came from a real‑world experience: my friend sent me a private message that was only visible once. That sparked the thought of building a web application where chats are secure, ephemeral, and suitable for confidential meetings. Companies could use a platform like this to conduct discussions that shouldn’t be logged or intercepted.

---

## Features ✅

- **Secure messaging** with basic steganography logic in the browser
- Simple React UI to type and view messages
- Utility functions under `src/utils` for encoding/decoding

---

## Not Working / Known Limitations ⚠️

- Custom error messages shown when something goes wrong are not yet implemented
- File analysis features (for attachments) are incomplete or broken

---

## Future Enhancements 🚀

Planned improvements include:

- Additional algorithms (e.g. stronger encryption, multiple steganography methods)
- Allow users to send not just text but documents and other files
- A more friendly, polished interface
- Open to community ideas for new features

---

## Main Components 🧱

- **`src/App.js`** – the root component that renders the UI and ties everything together
- **`src/utils/stegno.js`** – core steganography functions used by the app
- **`src/utils/converter.js`** – helpers for converting data formats
- **`src/utils/audioStegno.js`** – placeholder for audio-based steganography logic

Each major file under `src/` plays a role in the frontend logic of the application.

---

## File Overview 📁

| File | Purpose |
|------|---------|
| `src/App.js` | Main React component and UI container |
| `src/App.css` | Styling for the app |
| `src/index.js` | Entry point that renders `<App />` |
| `src/utils/stegno.js` | Encoding/decoding algorithms |
| `src/utils/converter.js` | Data conversion utilities |
| `src/utils/audioStegno.js` | Audio steganography (work in progress) |
| other CRA boilerplate files | Tests, service workers, etc. |

---

## About Me 👤

**Avinash** – creator of Stegno

- GitHub: [github.com/yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

Feel free to contact me for collaboration or feedback! 

---

*Thank you for checking out the project!*