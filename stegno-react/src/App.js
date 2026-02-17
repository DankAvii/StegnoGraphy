import { useState } from "react";
import { encodeLSB, decodeLSB } from "./utils/stegno";
import { encodeAudio, decodeAudio } from "./utils/audioStegno";
import { convertImageToPNG, convertAudioToWAV } from "./utils/converter";

function App() {
  const [mode, setMode] = useState("image");
  const [theme, setTheme] = useState("dark");
  const [algorithm, setAlgorithm] = useState("lsb");

  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);

  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [decodedMessage, setDecodedMessage] = useState("");

  const [unsupportedFile, setUnsupportedFile] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [isDecoding, setIsDecoding] = useState(false);
  const [toast, setToast] = useState("");

  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePlatform, setSharePlatform] = useState(null);
  const [showShareWarning, setShowShareWarning] = useState(false);

  // 🔔 Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // 🔐 Password Strength
  const getStrength = () => {
    if (!password) return "None";
    if (password.length < 4) return "Weak";
    if (password.length < 8) return "Medium";
    return "Strong";
  };

  // 📦 Capacity Meter
  const capacity =
    mode === "image" && image
      ? Math.floor((image.size * 0.75) / 1024)
      : mode === "audio" && audio
      ? Math.floor((audio.size * 0.5) / 1024)
      : 0;

  // =========================
  // 📂 FILE HANDLER
  // =========================
  const handleFile = (file) => {
    if (!file) return;

    setDecodedMessage("");

    if (mode === "image") {
      if (file.type !== "image/png") {
        setUnsupportedFile(file);
        setShowConvertModal(true);
        return;
      }
      setImage(file);
    }

    if (mode === "audio") {
      if (file.type !== "audio/wav") {
        setUnsupportedFile(file);
        setShowConvertModal(true);
        return;
      }
      setAudio(file);
    }
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  // 🖱 Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  // =========================
  // 🔄 CONVERT
  // =========================
  const handleConvert = async () => {
    if (!unsupportedFile) return;

    setIsConverting(true);

    try {
      if (mode === "image") {
        const converted = await convertImageToPNG(unsupportedFile);
        setImage(converted);
      }

      if (mode === "audio") {
        const converted = await convertAudioToWAV(unsupportedFile);
        setAudio(converted);
      }

      showToast("✅ File converted successfully");
      setUnsupportedFile(null);
    } catch {
      alert("❌ Conversion failed");
    }

    setIsConverting(false);
    setShowConvertModal(false);
  };

  // =========================
  // 🔐 ENCODE
  // =========================
  const handleEncode = () => {
    if (!message) return alert("Enter a message!");

    try {
      if (mode === "image") {
        if (!image) return alert("Select a PNG image!");

        if (algorithm === "lsb") encodeLSB(image, message);
        if (algorithm === "lsb-encrypted")
          encodeLSB(image, message, password);

        showToast("✅ Image encoded successfully");
      } else {
        if (!audio) return alert("Select a WAV audio!");

        encodeAudio(audio, message);
        showToast("✅ Audio encoded successfully");
      }
    } catch {
      alert("❌ Encoding failed");
    }
  };

  // =========================
  // 🔓 DECODE
  // =========================
  const handleDecode = () => {
    setDecodedMessage("");
    setIsDecoding(true);

    try {
      if (mode === "image") {
        if (!image) throw new Error();

        decodeLSB(image, password, (msg) => {
          setDecodedMessage(msg);
          setIsDecoding(false);
        });
      } else {
        if (!audio) throw new Error();

        decodeAudio(audio, (msg) => {
          setDecodedMessage(msg);
          setIsDecoding(false);
        });
      }
    } catch {
      alert("❌ Decode failed");
      setIsDecoding(false);
    }
  };

  // =========================
  // 🔗 SHARE LOGIC
  // =========================
  const shareText = encodeURIComponent(
    "Hidden message created with StegnoSafe 🔐"
  );
  const shareURL = encodeURIComponent(window.location.href);

  const handleShareClick = (platform) => {
    if (!image && !audio) {
      alert("⚠ Please encode a file first!");
      return;
    }

    setSharePlatform(platform);
    setShowShareWarning(true);
  };

  const confirmShare = () => {
    if (sharePlatform === "mail") {
      window.location.href =
        `mailto:?subject=StegnoSafe&body=${shareText}`;
    }

    if (sharePlatform === "whatsapp") {
      window.open(`https://wa.me/?text=${shareText}`, "_blank");
    }

    if (sharePlatform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${shareURL}`,
        "_blank"
      );
    }

    if (sharePlatform === "instagram") {
      alert("⚠ Instagram sharing is not supported via browser.\nPlease upload manually.");
    }

    if (sharePlatform === "snapchat") {
      alert("⚠ Snapchat sharing requires the mobile app.");
    }

    setShowShareWarning(false);
    setShowShareModal(false);
  };

  return (
    <div className={`App ${theme}`}>

      <header className="header">
        <span className="glitch" data-text="🕵️ StegnoSafe 🔐">
          🕵️ StegnoSafe 🔐
        </span>
      </header>

      <div className="content">
        <div className="panel">

          {/* 🌗 Theme */}
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            🌗 {theme === "dark" ? "Light" : "Dark"} Mode
          </button>

          {/* 🎯 Mode */}
          <div className="mode-switch">
            <button
              className={mode === "image" ? "active" : ""}
              onClick={() => {
                setMode("image");
                setAudio(null);
              }}
            >
              🖼 Image
            </button>

            <button
              className={mode === "audio" ? "active" : ""}
              onClick={() => {
                setMode("audio");
                setImage(null);
              }}
            >
              🎵 Audio
            </button>
          </div>

          {/* 🧠 Algorithm */}
          <select
            className="algo-select"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            {mode === "image" ? (
              <>
                <option value="lsb">🖼 LSB (Basic)</option>
                <option value="lsb-encrypted">🔐 LSB + AES</option>
              </>
            ) : (
              <option value="lsb">🎵 LSB (Basic)</option>
            )}
          </select>

          {/* ⬇ Drop */}
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            ⬇ Drag & Drop {mode === "image" ? "Image" : "Audio"} Here ⬇
          </div>

          <input
            type="file"
            accept={mode === "image" ? "image/*" : "audio/*"}
            onChange={handleFileChange}
          />

          <div className="capacity">📦 Capacity: ~{capacity} KB</div>

          {(image || audio) && (
            <div className="badge">
              {mode === "image" ? `🖼 ${image?.type}` : `🎵 ${audio?.type}`}
            </div>
          )}

          {mode === "image" && image && (
            <img src={URL.createObjectURL(image)} alt="preview" width="180" />
          )}

          {mode === "audio" && audio && (
            <audio controls src={URL.createObjectURL(audio)} />
          )}

          <textarea
            placeholder="Enter secret message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {mode === "image" && algorithm === "lsb-encrypted" && (
            <>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="strength">🔐 Strength: {getStrength()}</div>
            </>
          )}

          <div className="buttons">
            <button onClick={handleEncode}>🔐 Encode</button>
            <button onClick={handleDecode}>🔓 Decode</button>
          </div>

          <button onClick={() => setShowShareModal(true)}>
            🔗 Share
          </button>

          {isDecoding && (
            <div className="terminal">
              <p>Decrypting payload...</p>
              <p>Extracting bits...</p>
              <p>Reconstructing message...</p>
            </div>
          )}

          <textarea value={decodedMessage} readOnly />

        </div>
      </div>

      {/* 🔗 Share Modal */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔗 Share Via</h3>

            <div className="share-buttons">
              <button onClick={() => handleShareClick("mail")}>📧 Mail</button>
              <button onClick={() => handleShareClick("whatsapp")}>💬 WhatsApp</button>
              <button onClick={() => handleShareClick("facebook")}>📘 Facebook</button>
              <button onClick={() => handleShareClick("instagram")}>📸 Instagram</button>
              <button onClick={() => handleShareClick("snapchat")}>👻 Snapchat</button>
            </div>

            <button onClick={() => setShowShareModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ⚠ Share Warning */}
      {showShareWarning && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠ Share Notice</h3>
            <p>
              Only a <b>text notification</b> will be shared.<br /><br />
              Please attach the <b>encoded file manually</b>.
            </p>

            <div className="modal-buttons">
              <button onClick={confirmShare}>Continue</button>
              <button onClick={() => setShowShareWarning(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 Convert Modal */}
      {showConvertModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔄 Convert File</h3>

            {isConverting ? (
              <div className="progress">Converting... ⚡</div>
            ) : (
              <>
                <p>Convert to {mode === "image" ? "PNG" : "WAV"}?</p>
                <div className="modal-buttons">
                  <button onClick={handleConvert}>Convert</button>
                  <button onClick={() => setShowConvertModal(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      <canvas id="canvas" style={{ display: "none" }}></canvas>
    </div>
  );
}

export default App;
