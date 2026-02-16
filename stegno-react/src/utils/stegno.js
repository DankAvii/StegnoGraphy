import CryptoJS from "crypto-js";

const DELIMITER = "1111111111111110";

// --- Binary Helpers ---
function messageToBinary(message) {
  return message
    .split("")
    .map(char =>
      char.charCodeAt(0).toString(2).padStart(8, "0")
    )
    .join("");
}

function binaryToMessage(binary) {
  const bytes = binary.match(/.{1,8}/g);
  return bytes
    .map(byte =>
      String.fromCharCode(parseInt(byte, 2))
    )
    .join("");
}

// 🔐 Encrypt (OPTIONAL)
function encryptMessage(message, password) {
  if (!password) return message; // ✅ No password → no encryption
  return CryptoJS.AES.encrypt(message, password).toString();
}

// 🔓 Decrypt (OPTIONAL)
function decryptMessage(cipherText, password) {
  if (!password) return cipherText; // ✅ No password → treat as plain text

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted || cipherText; // fallback if wrong password
  } catch {
    return cipherText; // fallback to plain
  }
}

// --- Encode ---
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

    // 🔐 Encrypt only if password provided
    const processedMessage = encryptMessage(message, password);

    const binaryMessage = messageToBinary(processedMessage) + DELIMITER;

    if (binaryMessage.length > (data.length / 4) * 3) {
      alert("Message too large!");
      return;
    }

    let msgIndex = 0;

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        if (msgIndex < binaryMessage.length) {
          data[i + j] =
            (data[i + j] & ~1) |
            parseInt(binaryMessage[msgIndex]);
          msgIndex++;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const link = document.createElement("a");
    link.download = "stego.png";
    link.href = canvas.toDataURL();
    link.click();
  };
}

// --- Decode ---
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

    const endIndex = binaryData.indexOf(DELIMITER);

    if (endIndex === -1) {
      alert("No hidden message!");
      return;
    }

    const messageBinary = binaryData.slice(0, endIndex);
    const extractedMessage = binaryToMessage(messageBinary);

    // 🔓 Try decrypt (or fallback to plain)
    const finalMessage = decryptMessage(extractedMessage, password);

    setDecoded(finalMessage);
  };
}
