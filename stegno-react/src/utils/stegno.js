import CryptoJS from "crypto-js";

const DELIMITER = "1111111111111110";
const MAGIC = "STEG"; // 🛡 Signature

// =============================
// 🧮 Binary Helpers
// =============================
function messageToBinary(message) {
  return message
    .split("")
    .map(char =>
      char.charCodeAt(0).toString(2).padStart(8, "0")
    )
    .join("");
}

function binaryToMessage(binary) {
  const bytes = binary.match(/.{1,8}/g) || [];
  return bytes
    .map(byte =>
      String.fromCharCode(parseInt(byte, 2))
    )
    .join("");
}

function numberToBinary(num) {
  return num.toString(2).padStart(32, "0");
}

function binaryToNumber(bin) {
  return parseInt(bin, 2);
}

// =============================
// 🔐 Encrypt / Decrypt
// =============================
function encryptMessage(message, password) {
  if (!password) return message; // optional
  return CryptoJS.AES.encrypt(message, password).toString();
}

function decryptMessage(cipherText, password) {
  if (!password) return cipherText;

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted || null; // null = wrong password
  } catch {
    return null;
  }
}

// =============================
// 🔐 ENCODE IMAGE (ROBUST)
// =============================
export function encodeLSB(imageFile, message, password) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = URL.createObjectURL(imageFile);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 🔐 Optional encryption
    const processedMessage = encryptMessage(message, password);

    const magicBinary = messageToBinary(MAGIC);
    const messageBinary = messageToBinary(processedMessage);
    const lengthBinary = numberToBinary(messageBinary.length);

    // 🛡 MAGIC + LENGTH + MESSAGE + DELIMITER
    const fullBinary =
      magicBinary + lengthBinary + messageBinary + DELIMITER;

    if (fullBinary.length > (data.length / 4) * 3) {
      alert("❌ Message too large!");
      return;
    }

    let msgIndex = 0;

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        if (msgIndex < fullBinary.length) {
          data[i + j] =
            (data[i + j] & ~1) |
            parseInt(fullBinary[msgIndex]);
          msgIndex++;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const link = document.createElement("a");
    link.download = "stego.png";
    link.href = canvas.toDataURL();
    link.click();

    alert("✅ Encoding complete 😎🔥");
  };
}

// =============================
// 🔓 DECODE IMAGE (SMART)
// =============================
export function decodeLSB(imageFile, password, setDecoded) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = URL.createObjectURL(imageFile);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let binaryData = "";

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        binaryData += (data[i + j] & 1).toString();
      }
    }

    // 🛡 Try NEW robust decode first
    const magicBinary = binaryData.slice(0, 32);
    const magicText = binaryToMessage(magicBinary);

    if (magicText === MAGIC) {
      // ✅ New format detected

      const lengthBinary = binaryData.slice(32, 64);
      const messageLength = binaryToNumber(lengthBinary);

      if (!messageLength || messageLength <= 0) {
        alert("⚠ Invalid message length!");
        return;
      }

      const messageBinary = binaryData.slice(64, 64 + messageLength);

      if (messageBinary.length % 8 !== 0) {
        alert("⚠ Message corrupted!");
        return;
      }

      const extractedMessage = binaryToMessage(messageBinary);

      const decrypted = decryptMessage(extractedMessage, password);

      if (password && !decrypted) {
        alert("❌ Wrong password!");
        return;
      }

      setDecoded(decrypted || extractedMessage);
      return;
    }

    // 🔄 Fallback → OLD delimiter-only decode
    const endIndex = binaryData.indexOf(DELIMITER);

    if (endIndex === -1) {
      alert("❌ No hidden message!");
      return;
    }

    const messageBinary = binaryData.slice(0, endIndex);
    const extractedMessage = binaryToMessage(messageBinary);

    const decrypted = decryptMessage(extractedMessage, password);

    setDecoded(decrypted || extractedMessage);
  };
}
