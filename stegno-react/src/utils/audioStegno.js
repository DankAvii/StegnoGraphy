// =============================
// 🎵 AUDIO STEGANOGRAPHY FINAL (FIXED)
// Stereo + Mono + Robust Decode
// =============================

const MAGIC = "STEG";
const OFFSET = 100;

// --- Helpers ---
function textToBinary(text) {
  return text
    .split("")
    .map(char =>
      char.charCodeAt(0).toString(2).padStart(8, "0")
    )
    .join("");
}

function binaryToText(binary) {
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
// 🧱 WAV Builder
// =============================
function buildWAV(channels, sampleRate) {
  const numChannels = channels.length;
  const length = channels[0].length;

  const buffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  let offset = 0;

  writeString(offset, "RIFF"); offset += 4;
  view.setUint32(offset, 36 + length * numChannels * 2, true); offset += 4;
  writeString(offset, "WAVE"); offset += 4;

  writeString(offset, "fmt "); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numChannels * 2, true); offset += 4;
  view.setUint16(offset, numChannels * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;

  writeString(offset, "data"); offset += 4;
  view.setUint32(offset, length * numChannels * 2, true); offset += 4;

  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      view.setInt16(offset, channels[ch][i], true);
      offset += 2;
    }
  }

  return buffer;
}

// =============================
// ⬇ Download
// =============================
function downloadWAV(wavBuffer) {
  const blob = new Blob([wavBuffer], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "stego.wav";
  a.click();

  URL.revokeObjectURL(url);
}

// =============================
// 🎵 ENCODE AUDIO
// =============================
export async function encodeAudio(audioFile, message) {

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;

  const channels = [];

  for (let ch = 0; ch < numChannels; ch++) {
    const floatSamples = audioBuffer.getChannelData(ch);
    const int16Samples = new Int16Array(floatSamples.length);

    for (let i = 0; i < floatSamples.length; i++) {
      let s = Math.max(-1, Math.min(1, floatSamples[i]));
      int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    channels.push(int16Samples);
  }

  const magicBinary = textToBinary(MAGIC);
  const messageBinary = textToBinary(message);
  const lengthBinary = numberToBinary(messageBinary.length);

  const fullBinary = magicBinary + lengthBinary + messageBinary;

  if (OFFSET + fullBinary.length > channels[0].length) {
    alert("❌ Message too large!");
    return;
  }

  for (let i = 0; i < fullBinary.length; i++) {
    const index = OFFSET + i;

    for (let ch = 0; ch < numChannels; ch++) {
      channels[ch][index] =
        (channels[ch][index] & ~1) | parseInt(fullBinary[i]);
    }
  }

  const wavBuffer = buildWAV(channels, sampleRate);
  downloadWAV(wavBuffer);

  alert("✅ Audio encoded successfully 😎🔥");
}

// =============================
// 🎵 DECODE AUDIO (FIXED)
// =============================
export async function decodeAudio(audioFile, setDecoded) {

  const buffer = await audioFile.arrayBuffer();
  const view = new DataView(buffer);

  // ✅ Find "data" chunk dynamically
  let dataOffset = 12;

  while (dataOffset < buffer.byteLength) {
    const chunkID =
      String.fromCharCode(view.getUint8(dataOffset)) +
      String.fromCharCode(view.getUint8(dataOffset + 1)) +
      String.fromCharCode(view.getUint8(dataOffset + 2)) +
      String.fromCharCode(view.getUint8(dataOffset + 3));

    const chunkSize = view.getUint32(dataOffset + 4, true);

    if (chunkID === "data") {
      dataOffset += 8;
      break;
    }

    dataOffset += 8 + chunkSize;
  }

  if (dataOffset >= buffer.byteLength) {
    alert("❌ Invalid WAV file!");
    return;
  }

  const numChannels = view.getUint16(22, true);
  const bitsPerSample = view.getUint16(34, true);

  if (bitsPerSample !== 16) {
    alert("❌ Only 16-bit WAV supported!");
    return;
  }

  const samples = new Int16Array(buffer, dataOffset);

  console.log("Channels:", numChannels);
  console.log("Samples:", samples.length);

  function readBit(sampleIndex) {
    return (samples[sampleIndex] & 1).toString();
  }

  let pointer = OFFSET * numChannels;

  // ✅ MAGIC
  let magicBits = "";
  for (let i = 0; i < 32; i++) {
    magicBits += readBit(pointer);
    pointer += numChannels;
  }

  const magicText = binaryToText(magicBits);
  console.log("Magic:", magicText);

  if (magicText !== MAGIC) {
    alert("❌ No hidden message!");
    return;
  }

  // ✅ LENGTH
  let lengthBits = "";
  for (let i = 0; i < 32; i++) {
    lengthBits += readBit(pointer);
    pointer += numChannels;
  }

  const messageLength = binaryToNumber(lengthBits);
  console.log("Length:", messageLength);

  if (!messageLength || messageLength <= 0) {
    alert("⚠ Invalid length!");
    return;
  }

  if (pointer + messageLength * numChannels > samples.length) {
    alert("⚠ Message corrupted!");
    return;
  }

  let messageBits = "";

  for (let i = 0; i < messageLength; i++) {
    messageBits += readBit(pointer);
    pointer += numChannels;

    if (i % 4000 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  const decodedMessage = binaryToText(messageBits);
  console.log("Decoded:", decodedMessage);

  setDecoded(decodedMessage);
}
