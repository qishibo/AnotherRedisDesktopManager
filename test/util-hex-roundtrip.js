/**
 * Round-trip coverage for the hex editor encode/decode path (issue #1425).
 *
 * There is no unit-test runner in this repo. Run:
 *   node test/util-hex-roundtrip.js
 * or:
 *   npm run test:hex-roundtrip
 *
 * The hex editor displays with bufToString(buf, true) and saves with xToBuffer.
 * Invisible bytes are \xNN. Only the ambiguous backslash prefix is escaped as
 * \x5c; other visible ASCII stays raw so hex mode keeps its visualization.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function loadUtil() {
  const sourcePath = path.join(__dirname, '../src/util.js');
  const source = fs.readFileSync(sourcePath, 'utf8');

  if (!source.startsWith('export default')) {
    throw new Error(`unexpected util.js header in ${sourcePath}`);
  }

  const cjsSource = `module.exports = ${source.slice('export default'.length)}`;
  const sandbox = {
    module: { exports: {} },
    exports: {},
    require,
    Buffer,
    console,
  };
  vm.runInNewContext(cjsSource, sandbox, { filename: sourcePath });
  return sandbox.module.exports;
}

const util = loadUtil();

function assertRoundTrip(buf, label) {
  const shown = util.bufToHex(buf);
  const saved = util.xToBuffer(shown);

  assert.strictEqual(
    saved.length,
    buf.length,
    `${label}: save truncated ${buf.length} bytes to ${saved.length} (${shown})`,
  );
  assert.ok(
    saved.equals(buf),
    `${label}: ${buf.toString('hex')} -> ${JSON.stringify(shown)} -> ${saved.toString('hex')}`,
  );
  return shown;
}

function hexEditorSave(buf) {
  const contentDisplay = util.bufToString(buf, true);
  return {
    contentDisplay,
    saved: util.xToBuffer(contentDisplay),
  };
}

// Bytes 5C 78 are the characters "\x". 0xFF is not valid UTF-8, so the editor
// takes the \xNN path. The old encoder produced "\x\xff", xToBuffer read the
// next two characters ("\x") as hex, and decoding stopped. That is the
// truncation reported after the first 889 bytes.
const prefix = Buffer.alloc(889, 0x41);
const truncatedPattern = Buffer.concat([prefix, Buffer.from([0x5c, 0x78, 0xff])]);
assert.strictEqual(util.bufVisible(truncatedPattern), false);
const truncatedShown = assertRoundTrip(truncatedPattern, '5C 78 before \xff');
assert.ok(
  truncatedShown.endsWith('A\\x5cx\\xff'),
  `expected escaped backslash, got ${JSON.stringify(truncatedShown.slice(-12))}`,
);
assert.strictEqual(truncatedShown.includes('\\x\\x'), false);

// A visible "\x" sequence whose next two characters ARE hex used to collapse
// to one byte ("\xe1" -> 0xE1) instead of truncating. Same root cause.
const visibleSlashX = Buffer.from('\\xe1');
assert.deepStrictEqual([...visibleSlashX], [0x5c, 0x78, 0x65, 0x31]);
const visibleShown = assertRoundTrip(visibleSlashX, 'visible \\xe1');
assert.strictEqual(visibleShown, '\\x5cxe1');
assert.notStrictEqual(util.xToBuffer(visibleShown)[0], 0xe1);

// Printable text that merely contains "\x" must stay readable in hex view,
// with only the backslash escaped, and must survive save.
const editorVisible = hexEditorSave(visibleSlashX);
assert.strictEqual(editorVisible.contentDisplay, '\\x5cxe1');
assert.ok(editorVisible.saved.equals(visibleSlashX));

const mixedText = Buffer.from('中文\\xOK');
const editorMixed = hexEditorSave(mixedText);
assert.ok(editorMixed.contentDisplay.startsWith('中文'), editorMixed.contentDisplay);
assert.ok(editorMixed.contentDisplay.includes('\\x5cxOK'), editorMixed.contentDisplay);
assert.ok(editorMixed.saved.equals(mixedText));
assert.strictEqual(util.bufToString(Buffer.from('中文OK'), true), '中文OK');

// Text mode (forceHex false) still shows a printable backslash as "\".
assert.strictEqual(util.bufToString(visibleSlashX, false), '\\xe1');
assert.ok(Buffer.from(util.bufToString(visibleSlashX, false)).equals(visibleSlashX));

// Other visible ASCII is not rewritten as \xNN. Backslash is the exception.
const visibleAscii = [];
for (let code = 32; code <= 126; code += 1) {
  if (code !== 0x5c) {
    visibleAscii.push(code);
  }
}
const asciiBuf = Buffer.from(visibleAscii);
assert.strictEqual(util.bufToHex(asciiBuf), asciiBuf.toString('latin1'));
assert.strictEqual(util.bufToHex(Buffer.from([0x5c])), '\\x5c');
assert.strictEqual(util.bufToHex(Buffer.from('Hello, world!')), 'Hello, world!');

const mostlyText = Buffer.concat([
  Buffer.from('Hello, world! '),
  Buffer.from([0x5c, 0x78]),
  Buffer.from([0x0a]),
  Buffer.from(' OK'),
]);
const mostlyShown = assertRoundTrip(mostlyText, 'text with one escape');
assert.strictEqual(mostlyShown, 'Hello, world! \\x5cx\\x0a OK');
assert.deepStrictEqual(mostlyShown.match(/\\x[0-9a-f]{2}/g), ['\\x5c', '\\x0a']);

// Every byte pair, so 5C 78 and its neighbors cannot regress.
for (let hi = 0; hi < 256; hi += 1) {
  const buf = Buffer.alloc(512);
  for (let lo = 0; lo < 256; lo += 1) {
    buf[lo * 2] = hi;
    buf[(lo * 2) + 1] = lo;
  }
  assertRoundTrip(buf, `pairs starting with ${hi}`);
}

for (let i = 0; i < 256; i += 1) {
  assertRoundTrip(Buffer.from([0x5c, i]), `5C ${i.toString(16)}`);
  assertRoundTrip(Buffer.from([i, 0x78]), `${i.toString(16)} 78`);
}

const editorBinary = hexEditorSave(truncatedPattern);
assert.strictEqual(editorBinary.saved.length, truncatedPattern.length);
assert.strictEqual(editorBinary.saved.length, 892);
assert.ok(editorBinary.saved.equals(truncatedPattern));
assert.ok(editorBinary.contentDisplay.endsWith('A\\x5cx\\xff'));

// Valid UTF-8 that contains a literal "\x" never enters bufToHex. The hex
// editor still has to escape the backslash, and the following text stays put.
const printableSlashX = Buffer.concat([
  Buffer.alloc(20, 0x41),
  Buffer.from('\\xOK'),
]);
const editorPrintable = hexEditorSave(printableSlashX);
assert.strictEqual(editorPrintable.contentDisplay, `${'A'.repeat(20)}\\x5cxOK`);
assert.ok(editorPrintable.saved.equals(printableSlashX));

// Longer random buffers, including a trailing 5C 78. bufToHex is the binary
// path (byte by byte). The printable editor path is covered above.
for (let n = 0; n < 20; n += 1) {
  const length = 1 + Math.floor(Math.random() * 4000);
  const buf = Buffer.allocUnsafe(length);
  for (let i = 0; i < length; i += 1) {
    buf[i] = Math.floor(Math.random() * 256);
  }
  if (length > 4) {
    buf[length - 4] = 0x5c;
    buf[length - 3] = 0x78;
  }
  assertRoundTrip(buf, `random ${n}`);
}

assert.strictEqual(util.bufToHex(Buffer.alloc(0)), '');
assert.strictEqual(util.xToBuffer('').length, 0);

console.log('hex round-trip ok');
console.log('5C 78 case display tail:', JSON.stringify(truncatedShown.slice(-16)));
console.log('visible \\\\x display:', JSON.stringify(visibleShown));
