#!/usr/bin/env node
/* Locks the private part of the site.

   Reads   private/content.json  + every photo it mentions (inside private/)
   Writes  locked/               (encrypted, safe to push to a public repo)

   Usage:  node tools/lock.mjs            -> asks for the password
           SITE_PASSWORD="..." node tools/lock.mjs

   AES-256-GCM, key from PBKDF2-SHA256. No dependencies. */
import { readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { pbkdf2Sync, randomBytes, createCipheriv } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { dirname, join, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "private"), OUT = join(ROOT, "locked");
const ITER = 310000;
const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif", ".svg": "image/svg+xml" };
const PHOTO_KEYS = new Set(["photo", "thumb"]);

if (!existsSync(join(SRC, "content.json"))) { console.error("private/content.json not found."); process.exit(1); }
let content;
try { content = JSON.parse(readFileSync(join(SRC, "content.json"), "utf8")); }
catch (e) { console.error("private/content.json has a typo (not valid JSON):\n  " + e.message); process.exit(1); }

let pw = process.env.SITE_PASSWORD;
if (!pw) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  pw = (await rl.question("Password for the locked section: ")).trim();
  rl.close();
}
if (!pw || pw.length < 8) { console.error("Use a password of at least 8 characters (a short phrase is best)."); process.exit(1); }

const salt = randomBytes(16);
const key = pbkdf2Sync(pw, salt, ITER, 32, "sha256");
const seal = (buf) => {
  const iv = randomBytes(12), c = createCipheriv("aes-256-gcm", key, iv);
  return Buffer.concat([iv, c.update(buf), c.final(), c.getAuthTag()]);
};

// image size, so the page can hold the right space before a photo loads
function dims(buf, ext) {
  try {
    if (ext === ".png") return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (ext === ".svg") { const m = /viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/.exec(buf.toString("utf8", 0, 600)); if (m) return { w: +m[1], h: +m[2] }; }
    if (ext === ".jpg" || ext === ".jpeg") {
      let o = 2, rot = false;
      while (o < buf.length - 9) {
        if (buf[o] !== 0xff) { o++; continue; }
        const m = buf[o + 1], len = buf.readUInt16BE(o + 2);
        if (m === 0xe1 && buf.toString("latin1", o + 4, o + 8) === "Exif") {           // phone photos stored sideways
          const t = o + 10, le = buf.readUInt16BE(t) === 0x4949, r16 = (p) => (le ? buf.readUInt16LE(p) : buf.readUInt16BE(p));
          const ifd = t + (le ? buf.readUInt32LE(t + 4) : buf.readUInt32BE(t + 4)), n = r16(ifd);
          for (let k = 0; k < n; k++) { const e = ifd + 2 + k * 12; if (r16(e) === 0x0112) rot = r16(e + 8) >= 5; }
        }
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) {
          const h = buf.readUInt16BE(o + 5), w = buf.readUInt16BE(o + 7);
          return rot ? { w: h, h: w } : { w, h };
        }
        o += 2 + len;
      }
    }
  } catch { /* size is optional */ }
  return {};
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
let n = 0, bytes = 0;
const missing = [];
const walk = (v) => {
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, val] of Object.entries(v)) {
      if (PHOTO_KEYS.has(k) && typeof val === "string") {
        const p = resolve(SRC, val), ext = extname(p).toLowerCase();
        if (!p.startsWith(SRC + sep) || !existsSync(p) || !TYPES[ext]) { missing.push(val); o[k] = null; continue; }
        const buf = readFileSync(p), f = String(++n).padStart(3, "0") + ".enc";
        writeFileSync(join(OUT, f), seal(buf)); bytes += buf.length;
        o[k] = { f, t: TYPES[ext], ...dims(buf, ext) };
      } else o[k] = walk(val);
    }
    return o;
  }
  return v;
};
const sealed = walk(content);
writeFileSync(join(OUT, "content.enc"), seal(Buffer.from(JSON.stringify(sealed))));
writeFileSync(join(OUT, "meta.json"), JSON.stringify({ v: 1, salt: salt.toString("base64"), iterations: ITER, content: "content.enc" }));

console.log(`Locked ${n} photos (${(bytes / 1048576).toFixed(1)} MB) into locked/.`);
if (missing.length) console.log("Not found, skipped:\n  " + missing.join("\n  "));
if (bytes / Math.max(n, 1) > 1.5 * 1048576) console.log("Tip: your photos average over 1.5 MB. Export them at about 2000px wide so the site loads fast.");
console.log("Now:  git add -A && git commit -m \"Update our story\" && git push");
