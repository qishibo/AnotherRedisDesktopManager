// Schemaless protobuf wire-format helpers: a decoder (`getData`) and a
// validator (`isProtobufWire`).
//
// `getData` is a drop-in replacement for rawproto's `getData`. The difference:
// rawproto decodes wire-type-0 (varint) fields with `uint32()`, so int64/uint64
// values are truncated to 32 bits or throw on long varints. This decoder reads
// full 64-bit varints and renders values above Number.MAX_SAFE_INTEGER as
// decimal strings, so no precision is lost.
//
// It is decode-only and schema-less: field names/types are unknown, so it is a
// best-effort structural view (like rawproto). For schema-aware decode/encode,
// use protobufjs with a .proto file instead.
//

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

// ---- decoder ---------------------------------------------------------------

// Read an unsigned varint (up to `maxBytes` bytes) as a BigInt.
function readVarint(buf, state, maxBytes) {
  let result = BigInt(0);
  let shift = BigInt(0);
  let count = 0;
  let b;

  do {
    if (state.pos >= buf.length) {
      throw new Error('unexpected end of buffer');
    }
    b = buf[state.pos++];
    result |= BigInt(b & 0x7f) << shift;
    shift += BigInt(7);
    count += 1;
    if (count > maxBytes) {
      throw new Error('varint too long');
    }
  } while (b & 0x80);

  return result;
}

// Number when it fits safely, otherwise a decimal string (JSON friendly).
function bigintToValue(n) {
  return n <= MAX_SAFE ? Number(n) : n.toString();
}

function readFixed64(buf, state) {
  if (state.pos + 8 > buf.length) {
    throw new Error('unexpected end of buffer');
  }
  const low = buf.readUInt32LE(state.pos);
  const high = buf.readUInt32LE(state.pos + 4);
  state.pos += 8;
  return { low, high, unsigned: true };
}

function readFloat32(buf, state) {
  if (state.pos + 4 > buf.length) {
    throw new Error('unexpected end of buffer');
  }
  const value = buf.readFloatLE(state.pos);
  state.pos += 4;
  return value;
}

// True when the slice is valid UTF-8 text without control characters
// (tab/newline/carriage-return allowed). Nested messages almost always contain
// control bytes (tags/length prefixes), which distinguishes them from strings.
function isPrintableUtf8(sub) {
  const str = sub.toString('utf8');
  return Buffer.from(str, 'utf8').equals(sub)
    && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(str);
}

function decodeLengthDelimited(buf, state) {
  const len = Number(readVarint(buf, state, 10));
  if (state.pos + len > buf.length) {
    throw new Error('length out of range');
  }
  const sub = buf.subarray(state.pos, state.pos + len);
  state.pos += len;

  if (sub.length === 0) {
    return '';
  }

  // as nested messages just because their bytes happen to parse as tags.
  if (isPrintableUtf8(sub)) {
    return sub.toString('utf8');
  }

  // Otherwise try a nested message; fall back to raw bytes.
  try {
    const nested = decodeMessage(sub);
    if (nested.length > 0) {
      return nested;
    }
  } catch (e) {
    // not a message, fall through
  }

  return sub;
}

function decodeMessage(buf) {
  const state = { pos: 0 };
  const result = [];

  while (state.pos < buf.length) {
    const tag = readVarint(buf, state, 5);
    const field = Number(tag >> BigInt(3));
    const wire = Number(tag & BigInt(7));
    if (field < 1) {
      throw new Error('invalid field number');
    }

    let value;
    if (wire === 0) {
      value = bigintToValue(readVarint(buf, state, 10));
    } else if (wire === 1) {
      value = readFixed64(buf, state);
    } else if (wire === 2) {
      value = decodeLengthDelimited(buf, state);
    } else if (wire === 5) {
      value = readFloat32(buf, state);
    } else {
      // wire types 3/4 (deprecated groups) and 6/7 (invalid) are unsupported
      throw new Error('unsupported wire type ' + wire);
    }

    result.push({ [field]: value });
  }

  return result;
}

// Decode a protobuf buffer into a `[{ fieldNumber: value }]` structure.
export function getData(buf) {
  return decodeMessage(buf);
}

// ---- validator -------------------------------------------------------------

// Allocation-free linear validation of the protobuf wire format. It only walks
// tags/lengths (no object building), so it is cheap enough for large buffers
// and stays consistent with `getData` above: a message it accepts will decode
// without throwing.
export function isProtobufWire(buf) {
  let pos = 0;
  const len = buf.length;

  while (pos < len) {
    // field tag (varint)
    let tag = 0;
    let shift = 0;
    let b;
    do {
      if (pos >= len) return false;
      b = buf[pos++];
      tag |= (b & 0x7f) << shift;
      shift += 7;
      if (shift > 35) return false;
    } while (b & 0x80);

    const field = tag >>> 3;
    const wire = tag & 7;
    if (field < 1) return false;

    if (wire === 0) {
      // varint value
      let s = 0;
      do {
        if (pos >= len) return false;
        b = buf[pos++];
        s += 7;
        if (s > 70) return false;
      } while (b & 0x80);
    } else if (wire === 1) {
      // fixed64
      pos += 8;
      if (pos > len) return false;
    } else if (wire === 2) {
      // length-delimited: read length then skip
      let l = 0;
      let sh = 0;
      do {
        if (pos >= len) return false;
        b = buf[pos++];
        l |= (b & 0x7f) << sh;
        sh += 7;
        if (sh > 35) return false;
      } while (b & 0x80);
      pos += l;
      if (pos > len) return false;
    } else if (wire === 5) {
      // fixed32
      pos += 4;
      if (pos > len) return false;
    } else {
      // wire types 3/4 (deprecated groups) and 6/7 (invalid) are rejected
      return false;
    }
  }

  return true;
}
