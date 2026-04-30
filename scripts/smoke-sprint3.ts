import assert from "node:assert/strict";

type JsonBody = Record<string, unknown>;

const baseUrl = (process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);
const authCookie = process.env.SMOKE_AUTH_COOKIE?.trim();

type Step = {
  name: string;
  status: "pass" | "skip";
  detail: string;
};

const steps: Step[] = [];

function logPass(name: string, detail: string) {
  steps.push({ name, status: "pass", detail });
  console.log(`PASS ${name}: ${detail}`);
}

function logSkip(name: string, detail: string) {
  steps.push({ name, status: "skip", detail });
  console.log(`SKIP ${name}: ${detail}`);
}

async function callJson(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; body: JsonBody }> {
  const headers = new Headers(init.headers);
  if (authCookie) headers.set("Cookie", authCookie);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await res.text();
  let body: JsonBody = {};
  if (text.trim()) {
    try {
      body = JSON.parse(text) as JsonBody;
    } catch {
      body = { raw: text };
    }
  }
  return { status: res.status, body };
}

async function runPublicFlowSmoke() {
  const authSession = await callJson("/api/auth/session");
  assert.equal(authSession.status, 200);
  logPass("auth session endpoint", "returns 200");

  const seriesRes = await callJson("/api/catalog/series?limit=5");
  assert.equal(seriesRes.status, 200);
  const items = Array.isArray(seriesRes.body.items)
    ? (seriesRes.body.items as Array<Record<string, unknown>>)
    : [];
  assert.ok(items.length > 0, "Expected at least one public series");
  logPass("catalog series listing", `returned ${items.length} item(s)`);

  const firstSeriesId = items[0].id;
  assert.equal(typeof firstSeriesId, "string");
  const seriesId = firstSeriesId as string;

  const seriesDetail = await callJson(`/api/catalog/series/${seriesId}`);
  assert.equal(seriesDetail.status, 200);
  const chapters = Array.isArray(seriesDetail.body.chapters)
    ? (seriesDetail.body.chapters as Array<Record<string, unknown>>)
    : [];
  assert.ok(chapters.length > 0, "Expected at least one chapter");
  logPass("series details", `series ${seriesId} exposes ${chapters.length} chapter(s)`);

  const firstChapter = chapters[0];
  assert.equal(typeof firstChapter.id, "string");
  const chapterId = firstChapter.id as string;
  const isReadable = firstChapter.canReadBody === true;

  const chapterRes = await callJson(`/api/catalog/chapters/${chapterId}`);
  if (isReadable) {
    assert.equal(chapterRes.status, 200);
    logPass("chapter fetch (readable)", `chapter ${chapterId} returns 200`);
  } else {
    assert.equal(chapterRes.status, 403);
    logPass("chapter fetch (locked)", `chapter ${chapterId} returns 403`);
  }

  const unlockRes = await callJson(`/api/catalog/chapters/${chapterId}/unlock`, {
    method: "POST",
  });
  assert.ok(
    unlockRes.status === 401 || unlockRes.status === 403,
    `Expected 401 or 403 without auth; got ${unlockRes.status}`,
  );
  logPass(
    "unlock guard without auth",
    `returns ${unlockRes.status} (auth and env gate enforced)`,
  );
}

async function runStoryCrudSmoke() {
  if (!authCookie) {
    logSkip(
      "authenticated story CRUD",
      "Set SMOKE_AUTH_COOKIE to validate full create/update/delete flow",
    );
    return;
  }

  const nonce = Date.now().toString(36);
  const createRes = await callJson("/api/stories", {
    method: "POST",
    body: JSON.stringify({
      title: `Sprint3 smoke ${nonce}`,
      body: `Smoke body ${nonce}`,
      visibility: "private",
      genre: "test",
      mood: "neutral",
    }),
  });
  assert.equal(createRes.status, 201);
  assert.equal(typeof createRes.body.id, "string");
  const storyId = createRes.body.id as string;
  logPass("story create", `created ${storyId}`);

  const mineRes = await callJson("/api/stories/mine");
  assert.equal(mineRes.status, 200);
  const mine = Array.isArray(mineRes.body.items)
    ? (mineRes.body.items as Array<Record<string, unknown>>)
    : [];
  assert.ok(mine.some((s) => s.id === storyId), "Created story missing from /mine");
  logPass("story appears in mine", `found ${storyId}`);

  const patchRes = await callJson(`/api/stories/${storyId}`, {
    method: "PATCH",
    body: JSON.stringify({ title: `Sprint3 smoke updated ${nonce}`, visibility: "public" }),
  });
  assert.equal(patchRes.status, 200);
  logPass("story update", `updated ${storyId}`);

  const chaptersRes = await callJson(`/api/stories/${storyId}/chapters`, {
    method: "POST",
    body: JSON.stringify({
      title: "Smoke Chapter 2",
      body: "Secondary chapter from smoke test.",
      isFreePreview: false,
      priceCents: 199,
    }),
  });
  assert.equal(chaptersRes.status, 201);
  logPass("chapter create", `added chapter to ${storyId}`);

  const deleteRes = await callJson(`/api/stories/${storyId}`, { method: "DELETE" });
  assert.equal(deleteRes.status, 200);
  logPass("story delete", `deleted ${storyId}`);
}

async function main() {
  console.log(`Running Sprint 3 smoke suite against ${baseUrl}`);
  await runPublicFlowSmoke();
  await runStoryCrudSmoke();

  const passed = steps.filter((s) => s.status === "pass").length;
  const skipped = steps.filter((s) => s.status === "skip").length;
  console.log(`\nSmoke suite complete: ${passed} passed, ${skipped} skipped.`);
}

main().catch((error) => {
  console.error("Smoke suite failed:", error);
  process.exit(1);
});
