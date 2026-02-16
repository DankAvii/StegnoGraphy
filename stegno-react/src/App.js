import { useState } from "react";
import { encodeLSB, decodeLSB } from "./utils/stegno";

function App() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState(""); // 🔐 OPTIONAL
  const [decodedMessage, setDecodedMessage] = useState("");
  const [showMailInfo, setShowMailInfo] = useState(false);

  // 🔐 Encode
  const handleEncode = () => {
    if (!image || !message) {   // ✅ password removed
      alert("Select image & enter message!");
      return;
    }

    encodeLSB(image, message, password); // password may be empty ✅
  };

  // 🔓 Decode
  const handleDecode = () => {
    if (!image) {   // ✅ password removed
      alert("Select image first!");
      return;
    }

    decodeLSB(image, password, setDecodedMessage); // password optional ✅
  };

  // 📧 Open Mail App
  const handleEmailShare = () => {
    const subject = encodeURIComponent("StegnoSafe Image");
    const body = encodeURIComponent(
      "Here is the steganography encoded image."
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="App">

      <header className="header">
        🕵️ StegnoSafe 🔐
      </header>

      <div className="content">
        <div className="panel">

          <input
            type="file"
            accept="image/png"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <textarea
            placeholder="Enter secret message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* 🔐 OPTIONAL Password */}
          <input
            type="password"
            placeholder="Enter password (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="buttons">
            <button onClick={handleEncode}>🔐 Encode</button>
            <button onClick={handleDecode}>🔓 Decode</button>
          </div>

          <button onClick={() => setShowMailInfo(true)}>
            📧 Open Mail App
          </button>

          <textarea
            placeholder="Decoded message"
            value={decodedMessage}
            readOnly
          />

        </div>
      </div>

      <canvas id="canvas" style={{ display: "none" }}></canvas>

      {/* ✅ MODAL */}
      {showMailInfo && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>📧 Email Notice</h3>
            <p>
              This will open your mail application.<br /><br />
              ⚠ Only text will be sent.<br />
              Please attach the encoded image manually.
            </p>

            <div className="modal-buttons">
              <button onClick={() => {
                setShowMailInfo(false);
                handleEmailShare();
              }}>
                Continue
              </button>

              <button onClick={() => setShowMailInfo(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
