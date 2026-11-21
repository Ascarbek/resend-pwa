/**
 * A rune-based reactive value persisted to localStorage.
 * localStorage is the only client-side store (no DB by design).
 *
 * @example
 * const settings = persisted('settings', { theme: 'system' });
 * settings.value.theme = 'dark'; // saved automatically
 */
export function persisted<T>(key: string, initial: T) {
	let value = $state<T>(read(key, initial));

	$effect.root(() => {
		$effect(() => {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch {
				// Storage full or unavailable (private mode) — keep in-memory value.
			}
		});
	});

	return {
		get value() {
			return value;
		},
		set value(next: T) {
			value = next;
		}
	};
}

function read<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw === null ? fallback : (JSON.parse(raw) as T);
	} catch {
		return fallback;
	}
}
