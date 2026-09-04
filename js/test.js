/**
 * Round-trip check for the seanchló transformation tables.
 * Run: node js/test.js
 *
 * Loads gaelify.js in a sandbox with the bare minimum of browser stubs, so a
 * syntax error or a broken mapping table fails here rather than in the page.
 */
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sandbox = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  fetch: () => Promise.reject(new Error('no network in tests')),
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {}, getElementById: () => null, fonts: { load: () => Promise.resolve() } }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'gaelify.js'), 'utf8'), sandbox);

// Function declarations land on the sandbox global; `const` tables stay in the
// script's lexical scope, so reach those with an expression in the same context.
const { applyLenition, applyInsularLetters, applyTironianSign, reverseToModern } = sandbox;
const tables = vm.runInContext('({ standardReplacements, insularReplacements, insularChars })', sandbox);

function convert(text, { tironian = false, insular = false } = {}) {
  let out = applyLenition(text, insular);
  if (tironian) out = applyTironianSign(out);
  if (insular) out = applyInsularLetters(out);
  return out;
}

// Forward direction: lenition, insular letterforms, Tironian et.
assert.strictEqual(convert('bhí sé'), 'ḃí sé');
assert.strictEqual(convert('a chara'), 'a ċara');
assert.strictEqual(convert('Thomáis'), 'Ṫomáis');
assert.strictEqual(convert('dhá shúil', { insular: true }), 'ḋá ẛúil');
assert.strictEqual(convert('agus', { tironian: true }), '⁊');
assert.strictEqual(convert('AGUS', { tironian: true }), '⁊', 'Tironian is case-insensitive');

// Lenition must run before insular substitution, or 'dh' breaks into 'ꝺh'.
assert.ok(!convert('dhá', { insular: true }).includes('h'), 'lenition must precede insular forms');

// Unlenited letters do take insular forms.
assert.strictEqual(convert('teanga', { insular: true }), 'ꞇeanᵹa');

// Vowels, fadas, capitals and punctuation pass through untouched.
assert.strictEqual(convert('Éire, Á É Í Ó Ú!'), 'Éire, Á É Í Ó Ú!');
assert.strictEqual(convert('na hÉireann'), 'na hÉireann', 'h before a vowel is not lenition');

// Round trip: every forward conversion reverses exactly, except the Tironian
// sign, which has no case and so cannot restore the original capitalisation.
for (const text of [
  'bhí sé agus a chara',
  'dhá shúil',
  'Sheáin agus Thomáis',
  'an tSean-Ghaeilge',
  'Dia dhaoibh, a chairde!'
]) {
  for (const insular of [false, true]) {
    assert.strictEqual(reverseToModern(convert(text, { insular })), text,
      `round trip failed for "${text}" (insular: ${insular})`);
  }
  assert.strictEqual(reverseToModern(convert(text, { tironian: true, insular: true })),
    text.replace(/\bagus\b/gi, 'agus'),
    `Tironian round trip failed for "${text}"`);
}

// Every lenited and insular character has a reverse mapping.
for (const table of ['standardReplacements', 'insularReplacements', 'insularChars']) {
  for (const [letter, glyph] of Object.entries(tables[table])) {
    assert.ok(reverseToModern(glyph).toLowerCase().startsWith(letter.toLowerCase()),
      `${table}: ${letter} -> ${glyph} does not reverse`);
  }
}

// The proverbs file must stay parallel; displayRandomSeanfhocal indexes both by one index.
const proverbs = JSON.parse(fs.readFileSync(path.join(__dirname, 'seanfhocal.json'), 'utf8'));
assert.strictEqual(proverbs.irish.length, proverbs.english.length, 'proverb arrays must be parallel');
assert.ok(proverbs.irish.every(p => p.trim()), 'no empty proverbs');

console.log(`All checks passed (${proverbs.irish.length} proverbs).`);
