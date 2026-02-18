import { useState, useEffect } from "react";
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

  // Download Manager states
  const [encodedFile, setEncodedFile] = useState(null);
  const [encodedMessage, setEncodedMessage] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // File details state
  const [fileDetails, setFileDetails] = useState({
    name: "",
    resolution: { width: 0, height: 0 },
    size: 0,
    type: "",
    duration: 0 // for audio
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Password strength metrics
  const [passwordMetrics, setPasswordMetrics] = useState({
    length: 0,
    hasUpper: false,
    hasLower: false,
    hasNumbers: false,
    hasSymbols: false,
    strength: 0,
    strengthText: "None",
    color: "#ff0000"
  });

  // Customization states
  const [customization, setCustomization] = useState({
    themeStyle: "dark", // dark, light, cyberpunk, matrix, ocean
    fontSize: "medium", // small, medium, large
    density: "comfortable", // compact, comfortable, spacious
    accentColor: "#2563eb", // blue default
    glitchEffect: true,
    animations: true,
    fontFamily: "courier", // courier, mono, sans, serif
    borderRadius: "medium", // none, small, medium, large
    showParticles: true
  });

  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);

  const fontFamilies = {
    courier: "'Courier New', monospace",
    mono: "'Fira Code', 'JetBrains Mono', monospace",
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    serif: "'Merriweather', 'Georgia', serif"
  };

  // 🔔 Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // 🔐 Password Strength Analysis
  useEffect(() => {
    analyzePassword(password);
  }, [password]);

  // Apply customization on mount and when customization changes
  useEffect(() => {
    applyCustomization();
  }, [customization]);

  const applyCustomization = () => {
  // Get the root element
  const root = document.documentElement;
  
  // Apply font family
  root.style.setProperty('--font-family', fontFamilies[customization.fontFamily]);
  
  // Apply accent color - this is the key fix
  root.style.setProperty('--accent-color', customization.accentColor);
  
  // Also set specific color variables for different elements
  root.style.setProperty('--accent-color-rgb', hexToRgb(customization.accentColor));
  
  // Apply border radius
  const radii = {
    none: '0px',
    small: '8px',
    medium: '14px',
    large: '20px'
  };
  root.style.setProperty('--border-radius', radii[customization.borderRadius]);
  
  // Apply density
  const paddings = {
    compact: '12px',
    comfortable: '20px',
    spacious: '28px'
  };
  root.style.setProperty('--panel-padding', paddings[customization.density]);
  
  // Apply font size
  const fontSizes = {
    small: '12px',
    medium: '14px',
    large: '16px'
  };
  root.style.setProperty('--base-font-size', fontSizes[customization.fontSize]);
  
  // Apply theme - this sets the actual theme class
  if (customization.themeStyle === 'light') {
    setTheme('light');
  } else {
    setTheme('dark');
  }
  
  // Add theme style class for special themes
  const appElement = document.querySelector('.App');
  if (appElement) {
    // Remove all theme style classes
    appElement.classList.remove('cyberpunk-theme', 'matrix-theme', 'ocean-theme');
    // Add current theme style if it's a special theme
    if (['cyberpunk', 'matrix', 'ocean'].includes(customization.themeStyle)) {
      appElement.classList.add(`${customization.themeStyle}-theme`);
    }
  }
};

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '37, 99, 235';
};

  const analyzePassword = (pwd) => {
    const metrics = {
      length: pwd.length,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumbers: /[0-9]/.test(pwd),
      hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };

    // Calculate strength percentage
    let strength = 0;
    
    // Length contribution (up to 40%)
    if (pwd.length >= 12) strength += 40;
    else if (pwd.length >= 8) strength += 30;
    else if (pwd.length >= 6) strength += 20;
    else if (pwd.length >= 4) strength += 10;
    
    // Character type contributions (15% each)
    if (metrics.hasUpper) strength += 15;
    if (metrics.hasLower) strength += 15;
    if (metrics.hasNumbers) strength += 15;
    if (metrics.hasSymbols) strength += 15;

    // Cap at 100%
    strength = Math.min(100, strength);

    // Determine strength text and color
    let strengthText = "None";
    let color = "#ff0000";
    
    if (pwd.length === 0) {
      strengthText = "None";
      color = "#ff0000";
    } else if (strength < 30) {
      strengthText = "Weak";
      color = "#ff4444";
    } else if (strength < 60) {
      strengthText = "Medium";
      color = "#ffaa00";
    } else if (strength < 80) {
      strengthText = "Good";
      color = "#00cc88";
    } else {
      strengthText = "Strong";
      color = "#00ffaa";
    }

    setPasswordMetrics({
      ...metrics,
      strength,
      strengthText,
      color
    });
  };

  // Generate strong password
  const generateStrongPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";
    
    let password = "";
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Add random characters to reach length 16
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 0; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(password);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // =========================
  // 🎨 CUSTOMIZATION HANDLERS
  // =========================
  const handleCustomizationChange = (key, value) => {
    setCustomization(prev => {
      const updated = { ...prev, [key]: value };
      
      // Special handling for theme
      if (key === 'themeStyle') {
        if (value === 'light') {
          setTheme('light');
        } else {
          setTheme('dark');
        }
      }
      
      return updated;
    });
  };

  const resetCustomization = () => {
    setCustomization({
      themeStyle: "dark",
      fontSize: "medium",
      density: "comfortable",
      accentColor: "#2563eb",
      glitchEffect: true,
      animations: true,
      fontFamily: "courier",
      borderRadius: "medium",
      showParticles: true
    });
    setTheme("dark");
    
    // Remove special theme classes
    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.classList.remove('cyberpunk-theme', 'matrix-theme', 'ocean-theme');
    }
  };

  // 📊 Get file details
  const getFileDetails = async (file) => {
    if (!file) return;

    const details = {
      name: file.name,
      size: file.size,
      type: file.type,
      resolution: { width: 0, height: 0 },
      duration: 0
    };

    if (mode === "image" && file.type.startsWith("image/")) {
      // Get image resolution
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = () => {
          details.resolution = { width: img.width, height: img.height };
          URL.revokeObjectURL(img.src);
          resolve();
        };
      });
    } else if (mode === "audio" && file.type.startsWith("audio/")) {
      // Get audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        audio.onloadedmetadata = () => {
          details.duration = audio.duration;
          URL.revokeObjectURL(audio.src);
          resolve();
        };
      });
    }

    setFileDetails(details);
  };

  // 📦 Calculate capacity and usage
  const calculateCapacity = () => {
    if (!image && !audio) return { total: 0, used: 0, percentage: 0 };
    
    // Total capacity (75% of file size for images, 50% for audio)
    const totalCapacity = mode === "image" && image
      ? Math.floor((image.size * 0.75) / 1024)
      : mode === "audio" && audio
      ? Math.floor((audio.size * 0.5) / 1024)
      : 0;
    
    // Message size in KB (approximate, assuming 1 char = 1 byte)
    const messageSize = Math.ceil(new Blob([message]).size / 1024);
    
    // Calculate percentage (cap at 100%)
    const percentage = totalCapacity > 0 
      ? Math.min(100, Math.round((messageSize / totalCapacity) * 100))
      : 0;
    
    return {
      total: totalCapacity,
      used: messageSize,
      percentage
    };
  };

  const capacity = calculateCapacity();

  // =========================
  // 📂 FILE HANDLER
  // =========================
  const handleFile = (file) => {
    if (!file) return;

    setDecodedMessage("");
    setShowDownloadOptions(false);

    if (mode === "image") {
      if (file.type !== "image/png") {
        setUnsupportedFile(file);
        setShowConvertModal(true);
        return;
      }
      setImage(file);
      getFileDetails(file);
    }

    if (mode === "audio") {
      if (file.type !== "audio/wav") {
        setUnsupportedFile(file);
        setShowConvertModal(true);
        return;
      }
      setAudio(file);
      getFileDetails(file);
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
        getFileDetails(converted);
      }

      if (mode === "audio") {
        const converted = await convertAudioToWAV(unsupportedFile);
        setAudio(converted);
        getFileDetails(converted);
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

    // Check if message fits in capacity
    if (capacity.percentage > 100) {
      alert(`⚠ Message too large! Maximum capacity: ${capacity.total} KB`);
      return;
    }

    try {
      if (mode === "image") {
        if (!image) return alert("Select a PNG image!");

        if (algorithm === "lsb") encodeLSB(image, message, password);
        if (algorithm === "lsb-encrypted")
          encodeLSB(image, message, password);

        setEncodedFile(image);
        setEncodedMessage(message);
        setShowDownloadOptions(true);
        showToast("✅ Image encoded successfully");
      } else {
        if (!audio) return alert("Select a WAV audio!");

        encodeAudio(audio, message, password);
        setEncodedFile(audio);
        setEncodedMessage(message);
        setShowDownloadOptions(true);
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

        decodeAudio(audio, password, (msg) => {
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
  // ⬇ DOWNLOAD MANAGER
  // =========================
  const handleDownloadEncoded = () => {
    if (!image && !audio) {
      alert("⚠ No encoded file available!");
      return;
    }

    // Create a download link for the current file
    const fileToDownload = mode === "image" ? image : audio;
    if (!fileToDownload) return;

    const url = URL.createObjectURL(fileToDownload);
    const a = document.createElement("a");
    a.href = url;
    a.download = `encoded_${fileToDownload.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast("✅ File downloaded successfully");
  };

  const handleCopyHiddenText = () => {
    if (!message) {
      alert("⚠ No hidden text to copy!");
      return;
    }
    
    navigator.clipboard.writeText(message).then(() => {
      showToast("📋 Hidden text copied to clipboard");
    }).catch(() => {
      alert("❌ Failed to copy text");
    });
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Create capacity usage bar
  const renderCapacityBar = () => {
    const percentage = capacity.percentage;
    const barLength = 20; // Number of blocks
    const filledBlocks = Math.round((percentage / 100) * barLength);
    
    let bar = "";
    for (let i = 0; i < barLength; i++) {
      bar += i < filledBlocks ? "▓" : "░";
    }
    
    return bar;
  };

  return (
    <div className={`App ${theme}`}>
      <header className="header">
        <div className="header-content">
          <span className="glitch" data-text="🕵️ StegnoSafe 🔐" style={{ animation: customization.glitchEffect ? undefined : 'none' }}>
            🕵️ StegnoSafe 🔐
          </span>
          <div className="header-buttons">
            <button
              className="customize-toggle"
              onClick={() => setShowCustomizationPanel(!showCustomizationPanel)}
              title="Customize appearance"
            >
              🎨
            </button>
            <button
              className="theme-toggle"
              onClick={() => {
                const newTheme = theme === "dark" ? "light" : "dark";
                setTheme(newTheme);
                handleCustomizationChange('themeStyle', newTheme);
              }}
            >
              🌗 {theme === "dark" ? "Light" : "Dark"} Mode
            </button>
          </div>
        </div>
      </header>

      {/* Customization Panel */}
      {showCustomizationPanel && (
        <div className="customization-overlay">
          <div className="customization-panel">
            <div className="customization-header">
              <h3>🎨 Customize Theme</h3>
              <button onClick={() => setShowCustomizationPanel(false)} className="close-btn">✕</button>
            </div>

            <div className="customization-content">
              {/* Theme Selection */}
              <div className="customization-section">
                <h4>Theme Style</h4>
                <div className="theme-grid">
                  <button 
                    className={`theme-option ${customization.themeStyle === 'dark' ? 'active' : ''}`}
                    onClick={() => handleCustomizationChange('themeStyle', 'dark')}
                  >
                    <span className="theme-preview dark"></span>
                    <span>Dark</span>
                  </button>
                  <button 
                    className={`theme-option ${customization.themeStyle === 'light' ? 'active' : ''}`}
                    onClick={() => handleCustomizationChange('themeStyle', 'light')}
                  >
                    <span className="theme-preview light"></span>
                    <span>Light</span>
                  </button>
                  <button 
                    className={`theme-option ${customization.themeStyle === 'cyberpunk' ? 'active' : ''}`}
                    onClick={() => handleCustomizationChange('themeStyle', 'cyberpunk')}
                  >
                    <span className="theme-preview cyberpunk"></span>
                    <span>Cyberpunk</span>
                  </button>
                  <button 
                    className={`theme-option ${customization.themeStyle === 'matrix' ? 'active' : ''}`}
                    onClick={() => handleCustomizationChange('themeStyle', 'matrix')}
                  >
                    <span className="theme-preview matrix"></span>
                    <span>Matrix</span>
                  </button>
                  <button 
                    className={`theme-option ${customization.themeStyle === 'ocean' ? 'active' : ''}`}
                    onClick={() => handleCustomizationChange('themeStyle', 'ocean')}
                  >
                    <span className="theme-preview ocean"></span>
                    <span>Ocean</span>
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div className="customization-section">
                <h4>Accent Color</h4>
                <div className="color-grid">
                  {['#2563eb', '#00ffaa', '#ff4444', '#ffaa00', '#cc88ff', '#ff69b4'].map(color => (
                    <button
                      key={color}
                      className={`color-option ${customization.accentColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleCustomizationChange('accentColor', color)}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={customization.accentColor}
                    onChange={(e) => handleCustomizationChange('accentColor', e.target.value)}
                    className="color-picker"
                  />
                </div>
              </div>

              {/* Font Family */}
              <div className="customization-section">
                <h4>Font Family</h4>
                <select 
                  value={customization.fontFamily}
                  onChange={(e) => handleCustomizationChange('fontFamily', e.target.value)}
                  className="customization-select"
                >
                  <option value="courier">Courier (Hacker)</option>
                  <option value="mono">Monospace (Code)</option>
                  <option value="sans">Sans Serif (Clean)</option>
                  <option value="serif">Serif (Classic)</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="customization-section">
                <h4>Font Size</h4>
                <div className="size-options">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      className={`size-option ${customization.fontSize === size ? 'active' : ''}`}
                      onClick={() => handleCustomizationChange('fontSize', size)}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Density */}
              <div className="customization-section">
                <h4>Layout Density</h4>
                <div className="density-options">
                  {['compact', 'comfortable', 'spacious'].map(density => (
                    <button
                      key={density}
                      className={`density-option ${customization.density === density ? 'active' : ''}`}
                      onClick={() => handleCustomizationChange('density', density)}
                    >
                      {density.charAt(0).toUpperCase() + density.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="customization-section">
                <h4>Border Radius</h4>
                <div className="radius-options">
                  {['none', 'small', 'medium', 'large'].map(radius => (
                    <button
                      key={radius}
                      className={`radius-option ${customization.borderRadius === radius ? 'active' : ''}`}
                      onClick={() => handleCustomizationChange('borderRadius', radius)}
                    >
                      {radius.charAt(0).toUpperCase() + radius.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="customization-section">
                <h4>Effects</h4>
                <div className="toggle-options">
                  <label className="toggle-label">
                    <input 
                      type="checkbox" 
                      checked={customization.glitchEffect}
                      onChange={(e) => handleCustomizationChange('glitchEffect', e.target.checked)}
                    />
                    <span>Glitch Effect</span>
                  </label>
                  <label className="toggle-label">
                    <input 
                      type="checkbox" 
                      checked={customization.animations}
                      onChange={(e) => handleCustomizationChange('animations', e.target.checked)}
                    />
                    <span>Animations</span>
                  </label>
                  <label className="toggle-label">
                    <input 
                      type="checkbox" 
                      checked={customization.showParticles}
                      onChange={(e) => handleCustomizationChange('showParticles', e.target.checked)}
                    />
                    <span>Particles</span>
                  </label>
                </div>
              </div>

              {/* Reset Button */}
              <button onClick={resetCustomization} className="reset-btn">
                ↻ Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Mode</h3>
            <div className="mode-switch">
              <button
                className={mode === "image" ? "active" : ""}
                onClick={() => {
                  setMode("image");
                  setAudio(null);
                  setShowDownloadOptions(false);
                  setFileDetails({
                    name: "",
                    resolution: { width: 0, height: 0 },
                    size: 0,
                    type: "",
                    duration: 0
                  });
                }}
              >
                🖼 Image
              </button>

              <button
                className={mode === "audio" ? "active" : ""}
                onClick={() => {
                  setMode("audio");
                  setImage(null);
                  setShowDownloadOptions(false);
                  setFileDetails({
                    name: "",
                    resolution: { width: 0, height: 0 },
                    size: 0,
                    type: "",
                    duration: 0
                  });
                }}
              >
                🎵 Audio
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Algorithm</h3>
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
          </div>

          <div className="sidebar-section">
            <h3>Security</h3>
            <div className="password-container">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (optional)..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="password-input"
                />
                <button 
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  type="button"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <button 
                onClick={generateStrongPassword}
                className="generate-password-btn"
                title="Generate strong password"
              >
                ⚡
              </button>
            </div>
            
            {password && (
              <div className="password-strength-container">
                {/* Strength Meter Bar */}
                <div className="strength-meter">
                  <div 
                    className="strength-meter-fill"
                    style={{ 
                      width: `${passwordMetrics.strength}%`,
                      backgroundColor: passwordMetrics.color
                    }}
                  />
                </div>
                
                <div className="strength-text" style={{ color: passwordMetrics.color }}>
                  🔐 Strength: {passwordMetrics.strengthText} ({Math.round(passwordMetrics.strength)}%)
                </div>
                
                {/* Password Composition Diagram */}
                <div className="password-composition">
                  <div className="composition-item">
                    <span className="composition-label">Length:</span>
                    <div className="composition-bar-container">
                      <div 
                        className="composition-bar"
                        style={{ 
                          width: `${Math.min(100, (passwordMetrics.length / 20) * 100)}%`,
                          backgroundColor: passwordMetrics.length >= 12 ? "#00ffaa" : 
                                         passwordMetrics.length >= 8 ? "#00cc88" : "#ffaa00"
                        }}
                      />
                      <span className="composition-value">{passwordMetrics.length}/20+</span>
                    </div>
                  </div>
                  
                  <div className="composition-item">
                    <span className="composition-label">Uppercase:</span>
                    <div className="composition-bar-container">
                      <div 
                        className="composition-bar"
                        style={{ 
                          width: passwordMetrics.hasUpper ? "100%" : "0%",
                          backgroundColor: passwordMetrics.hasUpper ? "#00ffaa" : "#444"
                        }}
                      />
                      <span className="composition-value">{passwordMetrics.hasUpper ? "✓" : "✗"}</span>
                    </div>
                  </div>
                  
                  <div className="composition-item">
                    <span className="composition-label">Lowercase:</span>
                    <div className="composition-bar-container">
                      <div 
                        className="composition-bar"
                        style={{ 
                          width: passwordMetrics.hasLower ? "100%" : "0%",
                          backgroundColor: passwordMetrics.hasLower ? "#00ffaa" : "#444"
                        }}
                      />
                      <span className="composition-value">{passwordMetrics.hasLower ? "✓" : "✗"}</span>
                    </div>
                  </div>
                  
                  <div className="composition-item">
                    <span className="composition-label">Numbers:</span>
                    <div className="composition-bar-container">
                      <div 
                        className="composition-bar"
                        style={{ 
                          width: passwordMetrics.hasNumbers ? "100%" : "0%",
                          backgroundColor: passwordMetrics.hasNumbers ? "#00ffaa" : "#444"
                        }}
                      />
                      <span className="composition-value">{passwordMetrics.hasNumbers ? "✓" : "✗"}</span>
                    </div>
                  </div>
                  
                  <div className="composition-item">
                    <span className="composition-label">Symbols:</span>
                    <div className="composition-bar-container">
                      <div 
                        className="composition-bar"
                        style={{ 
                          width: passwordMetrics.hasSymbols ? "100%" : "0%",
                          backgroundColor: passwordMetrics.hasSymbols ? "#00ffaa" : "#444"
                        }}
                      />
                      <span className="composition-value">{passwordMetrics.hasSymbols ? "✓" : "✗"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <div className="content">
          <div className="content-grid">
            {/* Upload Section */}
            <section className="panel upload-section">
              <h2>📂 Upload {mode === "image" ? "Image" : "Audio"}</h2>
              
              <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                ⬇ Drag & Drop Here ⬇
              </div>

              <input
                type="file"
                accept={mode === "image" ? "image/*" : "audio/*"}
                onChange={handleFileChange}
              />

              {(image || audio) && (
                <>
                  {/* File Details Panel */}
                  <div className="file-details-panel">
                    <h4>📋 File Details</h4>
                    <div className="file-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">File:</span>
                        <span className="detail-value">{fileDetails.name || "N/A"}</span>
                      </div>
                      
                      {mode === "image" && fileDetails.resolution.width > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">Resolution:</span>
                          <span className="detail-value">
                            {fileDetails.resolution.width}×{fileDetails.resolution.height}
                          </span>
                        </div>
                      )}
                      
                      {mode === "audio" && fileDetails.duration > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">Duration:</span>
                          <span className="detail-value">{formatDuration(fileDetails.duration)}</span>
                        </div>
                      )}
                      
                      <div className="detail-item">
                        <span className="detail-label">Size:</span>
                        <span className="detail-value">{formatFileSize(fileDetails.size)}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{fileDetails.type || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Usage Bar */}
                  <div className="capacity-usage-panel">
                    <h4>📊 Capacity Usage</h4>
                    <div className="capacity-details">
                      <div className="capacity-item">
                        <span>Total Capacity:</span>
                        <span>{capacity.total} KB</span>
                      </div>
                      <div className="capacity-item">
                        <span>Message Size:</span>
                        <span>{capacity.used} KB</span>
                      </div>
                      <div className="capacity-bar-container">
                        <div className="capacity-bar-labels">
                          <span>Usage:</span>
                          <span className="capacity-percentage">{capacity.percentage}%</span>
                        </div>
                        <div className="capacity-bar">
                          <div 
                            className="capacity-bar-fill"
                            style={{ 
                              width: `${capacity.percentage}%`,
                              backgroundColor: capacity.percentage > 90 ? "#ff4444" :
                                             capacity.percentage > 70 ? "#ffaa00" : "#00ffaa"
                            }}
                          />
                        </div>
                        <div className="capacity-bar-text">
                          {renderCapacityBar()} {capacity.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {mode === "image" && image && (
                <div className="preview-container">
                  <img src={URL.createObjectURL(image)} alt="preview" />
                </div>
              )}

              {mode === "audio" && audio && (
                <div className="audio-container">
                  <audio controls src={URL.createObjectURL(audio)} />
                </div>
              )}
            </section>

            {/* Message & Controls Section */}
            <section className="panel message-section">
              <h2>💬 Message</h2>
              
              <textarea
                placeholder="Enter your secret message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-textarea"
              />

              <div className="action-buttons">
                <button onClick={handleEncode} className="encode-btn">🔐 Encode</button>
                <button onClick={handleDecode} className="decode-btn">🔓 Decode</button>
              </div>

              <button onClick={() => setShowShareModal(true)} className="share-btn">
                🔗 Share
              </button>

              {/* Download Manager - Appears after encoding */}
              {showDownloadOptions && (
                <div className="download-manager">
                  <h4>⬇ Download Manager</h4>
                  <div className="download-buttons">
                    <button onClick={handleDownloadEncoded} className="download-btn">
                      ⬇ Download Encoded File
                    </button>
                    <button onClick={handleCopyHiddenText} className="copy-btn">
                      📋 Copy Hidden Text
                    </button>
                  </div>
                  <div className="download-info">
                    <span className="info-badge">File: encoded_{mode === "image" ? image?.name : audio?.name}</span>
                    <span className="info-badge">Size: {formatFileSize(mode === "image" ? image?.size : audio?.size)}</span>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Results Section */}
          <section className="panel results-section">
            <h2>📄 Results</h2>
            
            {isDecoding && (
              <div className="terminal" style={{ animation: customization.animations ? undefined : 'none' }}>
                <p>Decrypting payload...</p>
                <p>Extracting bits...</p>
                <p>Reconstructing message...</p>
              </div>
            )}

            <textarea 
              value={decodedMessage} 
              readOnly
              placeholder="Decoded message will appear here..."
              className="results-textarea"
            />
          </section>
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

      {/* Particles effect */}
      {customization.showParticles && <canvas id="canvas" style={{ display: "none" }}></canvas>}
    </div>
  );
}

export default App;