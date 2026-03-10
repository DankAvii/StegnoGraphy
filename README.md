# 🕵️ StegnoSafe 🔐
A Secure Steganography Web Application for Hidden Communication

---

## 📌 About The Project

**StegnoSafe** is a web application that allows users to hide secret messages inside images and audio files using **steganography techniques**.  

The application provides a secure way to send confidential messages without revealing that communication is taking place.

Instead of sending plain text messages, users can embed the message inside media files such as **PNG images or WAV audio files**, making the communication discreet and secure.

This project was developed as a **security and information hiding experiment** and demonstrates practical implementation of **steganography, password protection, and steganographic analysis**.

---

# 💡 Why This Project Was Created

The idea for this project came from a real-life situation.

One day, my friend sent me a **private message that could only be viewed once**. After reading it, the message disappeared automatically.

This made me curious about **secure communication systems**.

I started thinking:

> What if we could send secret messages that are hidden inside normal files like images or audio?

From this idea, I decided to create a **web application that allows users to hide messages securely inside media files**.

Such a system can also be useful for:

- Secure personal communication
- Private data sharing
- Secure company discussions
- Confidential meeting information exchange

Thus, **StegnoSafe** was created as a **secure communication tool using steganography**.

---

# ✨ Features

The project currently includes the following features:

### 🔐 Message Encoding
- Hide secret messages inside **PNG images**
- Hide secret messages inside **WAV audio files**

### 🔑 Password Protection
- Password-protected message encoding
- Password required to decode hidden messages

### 💣 Self Destruct Messages
Messages can be configured to:
- Disappear after first viewing
- Expire after a specific time

### 📊 Steganography Analysis
The application can analyze files and detect potential hidden data by checking:
- LSB entropy
- Pixel distribution
- Noise levels
- Statistical anomalies

### 🔍 File Details Viewer
Displays file information such as:
- File name
- File size
- Image resolution
- Audio duration

### 📦 Capacity Calculator
Calculates how much data can be hidden inside a file before encoding.

### 🔐 Password Strength Analyzer
Checks password strength using:
- length
- uppercase characters
- lowercase characters
- numbers
- symbols

### 🎨 Customizable Interface
Users can customize the UI including:
- theme mode (dark/light)
- accent color
- font style
- UI density

### 📥 Download Manager
After encoding, users can:
- download encoded file
- copy hidden message

### 🔗 Share Options
Share encoded files through:
- WhatsApp
- Email
- Facebook

---

# ⚠ Known Limitations

Some features in the current version are **not fully functional** or require improvements.

### ❌ Custom Wrong Password Message
The feature that allows users to display a **custom message when a wrong password is entered** is currently unstable.

### ❌ File Analysis Accuracy
The **file analysis system** is currently experimental and does not always produce accurate results.

These features will be improved in future versions.

---

# 🚀 Future Improvements

Planned improvements for the next versions of the project include:

### 🔐 More Steganography Algorithms
Add more algorithms such as:

- DCT Steganography
- DWT Steganography
- Spread Spectrum Steganography
- AES encrypted steganography

### 📂 Support More File Types
Allow hiding data inside:

- Documents (PDF, DOCX)
- Videos
- ZIP files
- Other media formats

### 💬 Secure Messaging System
Convert the project into a **secure messaging platform** where users can send hidden messages directly.

### 🎨 Better User Interface
Improve UI design to make the application more:

- user friendly
- responsive
- interactive

### ☁ Cloud Storage
Allow users to store encoded files securely on cloud storage.

### 🔑 Multi Layer Encryption
Add encryption algorithms such as:

- AES
- RSA
- SHA hashing

### 🤖 AI Based Steganography Detection
Improve file analysis using advanced statistical models.

### 📱 Mobile Support
Develop a **mobile version of the application**.

---

# 🧠 Main Components of the Project

### 1️⃣ Encoding System
This component hides secret text inside image or audio files using steganography algorithms.

### 2️⃣ Decoding System
Extracts hidden messages from encoded files using the correct password.

### 3️⃣ Password Security System
Ensures that hidden messages can only be accessed with the correct password.

### 4️⃣ File Analysis Engine
Analyzes uploaded files to detect potential hidden data.

### 5️⃣ Self Destruct Messaging
Ensures that messages disappear after viewing or after a timer.

### 6️⃣ File Information System
Displays metadata and capacity of uploaded files.

### 7️⃣ UI Customization System
Allows users to change the appearance of the application.


---
# 📂 File Structure
StegnoSafe
│
├── src
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── utils
│       ├── stegno.js
│       ├── audioStegno.js
│       └── converter.js
│
├── public
├── package.json
└── README.md

# 📂 File Explanation

### `App.js`
Main React component that controls the entire application.

It manages:

- encoding
- decoding
- UI state
- file upload
- steganography detection
- password system
- self-destruct feature

---

### `App.css`

Contains the entire **UI design and styling** including:

- cyber themed design
- animations
- responsive layout
- theme customization

---

### `utils/stegno.js`

Handles **image steganography**.

Functions include:

- hiding text inside PNG images
- extracting hidden text from images

---

### `utils/audioStegno.js`

Handles **audio steganography**.

Functions include:

- hiding messages inside WAV audio
- decoding hidden messages from audio files

---

### `utils/converter.js`

Used to convert unsupported files into supported formats:

- convert images to PNG
- convert audio to WAV

---

### `index.js`

Entry point of the React application.

It renders the main `App` component.

---

# 🛠 How To Run This Project From Scratch

Follow these steps to run the project locally.

---

### 1️⃣ Install Node.js

Download and install Node.js:

https://nodejs.org

---

### 2️⃣ Clone the Repository

  bash
git clone https://github.com/DankAvii/StegnoGraphy
cd StegnoGraphy
npm install
npm start

---

## 👤 About Me

**Avinash Pradhan** – Creator of StegnoSafe

I am a Computer Science student interested in cybersecurity, secure communication systems, and web development.  
This project reflects my curiosity about privacy technologies and how hidden communication methods like steganography can be used for secure messaging and confidential information sharing.

### 📫 Contact

GitHub: https://github.com/DankAvii  
Email: avinashpradhan7777@gmail.com  
LinkedIn: https://linkedin.com/in/dankavi-pradhan-090ab2399
