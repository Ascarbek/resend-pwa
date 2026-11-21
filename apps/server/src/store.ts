/**
 * Tiny JSON-file store for the little server-side state we need (no real DB by design).
 *
 * - Whole file is loaded into memory on startup; reads are synchronous and in-memory.
 * - Every `update()` rewrites the file atomically (temp file + rename), and writes are
 *   serialised so concurrent updates can't interleave.
 * - Keep it small: email data belongs in Resend, client state in localStorage.
 */
import { chmod, rename } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { PushSubscription } from 'web-push';
import { env } from './env.ts';

export interface Data {
	/** Bump and migrate in `load()` when the shape changes. */
	version: 1;
	pushSubscriptions: PushSubscription[];
}

const DEFAULT_DATA: Data = { version: 1, pushSubscriptions: [] };

const filePath = resolve(env.dataFile);
let data: Data = await load();
let writeQueue: Promise<void> = Promise.resolve();

async function load(): Promise<Data> {
	const file = Bun.file(filePath);
	if (!(await file.exists())) return structuredClone(DEFAULT_DATA);
	try {
		return { ...structuredClone(DEFAULT_DATA), ...((await file.json()) as Partial<Data>) };
	} catch (err) {
		// Refuse to start on a corrupt file rather than silently overwrite it.
		throw new Error(`[store] cannot parse ${filePath}: ${(err as Error).message}`);
	}
}

async function persist(snapshot: string): Promise<void> {
	mkdirSync(dirname(filePath), { recursive: true });
	const tmp = `${filePath}.tmp`;
	await Bun.write(tmp, snapshot);
	await chmod(tmp, 0o600); // may contain push endpoints/keys
	await rename(tmp, filePath);
}

/** Read-only view of the current data. Mutate only through `update()`. */
export function read(): Readonly<Data> {
	return data;
}

/** Apply a mutation and persist it. Resolves once the change is on disk. */
export function update(mutate: (draft: Data) => void): Promise<void> {
	mutate(data);
	const snapshot = JSON.stringify(data, null, '\t');
	writeQueue = writeQueue
		.then(() => persist(snapshot))
		.catch((err) => console.error('[store] write failed', err));
	return writeQueue;
}

console.log(`[store] using ${filePath}`);
