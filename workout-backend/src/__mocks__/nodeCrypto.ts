const randomFillSync = (buffer: Uint8Array): Uint8Array => {
  for (let i = 0; i < buffer.length; i += 1) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  return buffer;
};

const randomBytes = (size: number): Buffer => {
  const buffer = Buffer.alloc(size);
  randomFillSync(buffer);
  return buffer;
};

export default {
  randomFillSync,
  randomBytes,
};
