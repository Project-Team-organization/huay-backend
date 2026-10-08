const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  detectImageExt,
  generateSafeName,
  resolveSafePath,
  safeDelete,
  saveImageBuffer,
  isSafeLink,
} = require("../utils/promoBannerUpload");

const pad = (arr) => Buffer.concat([Buffer.from(arr), Buffer.alloc(16)]);

test("detectImageExt: magic bytes ของแต่ละชนิด", () => {
  assert.strictEqual(detectImageExt(pad([0xff, 0xd8, 0xff, 0xe0])), "jpg");
  assert.strictEqual(
    detectImageExt(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    "png"
  );
  assert.strictEqual(detectImageExt(pad(Buffer.from("GIF87a"))), "gif");
  assert.strictEqual(detectImageExt(pad(Buffer.from("GIF89a"))), "gif");
  const webp = Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.alloc(4),
    Buffer.from("WEBP"),
    Buffer.alloc(8),
  ]);
  assert.strictEqual(detectImageExt(webp), "webp");
});

test("detectImageExt: ปฏิเสธไฟล์ปลอมและ RIFF ที่ไม่ใช่ WEBP", () => {
  assert.strictEqual(detectImageExt(Buffer.from("<svg xmlns='x'></svg>")), null);
  assert.strictEqual(detectImageExt(Buffer.from("MZ" + "\0".repeat(30))), null);
  assert.strictEqual(detectImageExt(Buffer.from("hello world text file")), null);
  const wav = Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.alloc(4),
    Buffer.from("WAVE"),
    Buffer.alloc(8),
  ]);
  assert.strictEqual(detectImageExt(wav), null);
  assert.strictEqual(detectImageExt(Buffer.alloc(3)), null);
  assert.strictEqual(detectImageExt(null), null);
});

test("generateSafeName: สุ่ม ไม่มี path traversal", () => {
  const a = generateSafeName("png");
  const b = generateSafeName("png");
  assert.notStrictEqual(a, b);
  assert.match(a, /^[0-9a-f]{32}\.png$/);
  assert.ok(!a.includes("..") && !a.includes("/") && !a.includes("\\"));
});

test("resolveSafePath / safeDelete: ไม่หลุดออกนอก uploadDir", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "promo-"));
  const outside = path.join(path.dirname(dir), "outside-" + path.basename(dir));
  fs.writeFileSync(outside, "x");
  try {
    const inside = path.join(dir, "a.png");
    fs.writeFileSync(inside, "x");

    assert.strictEqual(resolveSafePath("a.png", dir), inside);
    assert.strictEqual(
      resolveSafePath("../" + path.basename(outside), dir),
      path.join(dir, path.basename(outside))
    );
    assert.strictEqual(resolveSafePath("", dir), null);
    assert.strictEqual(resolveSafePath("..", dir), null);
    assert.strictEqual(resolveSafePath(undefined, dir), null);

    await safeDelete("../" + path.basename(outside), dir);
    assert.ok(fs.existsSync(outside), "ไฟล์นอก dir ต้องไม่ถูกลบ");

    assert.strictEqual(await safeDelete("a.png", dir), true);
    assert.ok(!fs.existsSync(inside));
    assert.strictEqual(await safeDelete("a.png", dir), false); // ENOENT เงียบ
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(outside, { force: true });
  }
});

test("saveImageBuffer: เขียนไฟล์ชื่อสุ่ม และปฏิเสธไฟล์ที่ไม่ใช่รูป", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "promo-"));
  try {
    const { fileName, imageUrl } = await saveImageBuffer(
      pad([0xff, 0xd8, 0xff, 0xe0]),
      dir
    );
    assert.match(fileName, /^[0-9a-f]{32}\.jpg$/);
    assert.strictEqual(imageUrl, `/uploads/promotions/${fileName}`);
    assert.ok(fs.existsSync(path.join(dir, fileName)));
    await assert.rejects(() => saveImageBuffer(Buffer.from("not an image at all"), dir));
    assert.strictEqual(fs.readdirSync(dir).length, 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("isSafeLink", () => {
  for (const ok of [
    "",
    undefined,
    null,
    "https://example.com/a?b=1",
    "http://example.com",
    "/promotion/1",
  ]) {
    assert.strictEqual(isSafeLink(ok), true, String(ok));
  }
  for (const bad of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html;base64,AAAA",
    "//evil.com",
    "/\\evil.com",
    "example.com",
    "ftp://example.com",
    "https://" + "a".repeat(2050),
    123,
  ]) {
    assert.strictEqual(isSafeLink(bad), false, String(bad));
  }
});
