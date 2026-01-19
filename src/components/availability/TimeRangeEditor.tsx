import { useEffect, useMemo, useState } from "react";
import { hhmmToMinsStrict, minsToHHmm, normalizeRanges } from "../../utility/lib/time";

export type TimeRange = { startMins: number; endMins: number };

type Props = {
	ranges: TimeRange[];
	onChange: (next: TimeRange[]) => void;
};

type DraftRow = {
	startText: string;
	endText: string;
	dirty: boolean;
	error?: string;
};

const MIN_GAP = 30;

function overlaps(a: TimeRange, b: TimeRange) {
	return Math.max(a.startMins, b.startMins) < Math.min(a.endMins, b.endMins);
}

function clamp(mins: number) {
	return Math.max(0, Math.min(24 * 60, mins));
}

function adjustToMinGap(
	start: number,
	end: number,
	changedField: "start" | "end"
): TimeRange {
	start = clamp(start);
	end = clamp(end);

	if (start >= end) {
		if (changedField === "start") {
			end = clamp(start + MIN_GAP);
			if (end <= start) start = clamp(end - MIN_GAP);
		} else {
			start = clamp(end - MIN_GAP);
			if (end <= start) end = clamp(start + MIN_GAP);
		}
	}
	return { startMins: start, endMins: end };
}

export function TimeRangeEditor({ ranges, onChange }: Props) {
	// Draft rows keyed by index
	const [draft, setDraft] = useState<Record<number, DraftRow>>({});

	// Keep draft aligned with ranges (add/remove rows)
	useEffect(() => {
		setDraft((prev) => {
			const next: Record<number, DraftRow> = {};
			for (let i = 0; i < ranges.length; i++) {
				next[i] =
					prev[i] ??
					({
						startText: minsToHHmm(ranges[i].startMins),
						endText: minsToHHmm(ranges[i].endMins),
						dirty: false,
					} satisfies DraftRow);
			}
			return next;
		});
	}, [ranges.length]);

	const rows = useMemo(() => {
		return ranges.map((r, idx) => {
			const dr = draft[idx];
			return {
				idx,
				stored: r,
				startText: dr?.startText ?? minsToHHmm(r.startMins),
				endText: dr?.endText ?? minsToHHmm(r.endMins),
				dirty: dr?.dirty ?? false,
				error: dr?.error,
			};
		});
	}, [ranges, draft]);

	const setDraftField = (idx: number, field: "startText" | "endText", value: string) => {
		setDraft((prev) => {
			const base = prev[idx] ?? {
				startText: minsToHHmm(ranges[idx].startMins),
				endText: minsToHHmm(ranges[idx].endMins),
				dirty: false,
			};
			return {
				...prev,
				[idx]: {
					...base,
					[field]: value,
					dirty: true,
					error: undefined,
				},
			};
		});
	};

	const removeAt = (idx: number) => {
		const next = ranges.filter((_, i) => i !== idx);
		onChange(next);
		setDraft((prev) => {
			const copy = { ...prev };
			delete copy[idx];
			// reindex drafts after deletion
			const reindexed: Record<number, DraftRow> = {};
			let j = 0;
			for (let i = 0; i < next.length; i++) {
				reindexed[i] =
					copy[i < idx ? i : i + 1] ?? {
						startText: minsToHHmm(next[i].startMins),
						endText: minsToHHmm(next[i].endMins),
						dirty: false,
					};
				j++;
			}
			return reindexed;
		});
	};

	const addRange = () => {
		const normalized = normalizeRanges(ranges);
		const last = normalized[normalized.length - 1];
		const start = last ? Math.min(last.endMins + 30, 23 * 60) : 18 * 60;
		const end = Math.min(start + 120, 24 * 60);
		const safe = end > start ? { startMins: start, endMins: end } : { startMins: 16 * 60, endMins: 18 * 60 };

		onChange([...ranges, safe]);
	};

	const cancelRow = (idx: number) => {
		setDraft((prev) => ({
			...prev,
			[idx]: {
				startText: minsToHHmm(ranges[idx].startMins),
				endText: minsToHHmm(ranges[idx].endMins),
				dirty: false,
				error: undefined,
			},
		}));
	};

	const saveRow = (idx: number) => {
		const dr = draft[idx];
		if (!dr) return;

		const startMins = hhmmToMinsStrict(dr.startText);
		const endMins = hhmmToMinsStrict(dr.endText);

		if (startMins == null || endMins == null) {
			setDraft((prev) => ({
				...prev,
				[idx]: { ...prev[idx], error: "Please enter times as HH:MM (e.g. 09:30)." } as DraftRow,
			}));
			return;
		}

		// Determine which field "changed more" for adjustment direction
		// If you want exact, track lastEdited; for now infer:
		const changedField: "start" | "end" = dr.startText !== minsToHHmm(ranges[idx].startMins) ? "start" : "end";

		const candidate = adjustToMinGap(startMins, endMins, changedField);

		if (candidate.endMins <= candidate.startMins) {
			setDraft((prev) => ({
				...prev,
				[idx]: { ...prev[idx], error: "End must be after start." } as DraftRow,
			}));
			return;
		}

		// Check overlap against other ranges (excluding idx)
		for (let i = 0; i < ranges.length; i++) {
			if (i === idx) continue;
			if (overlaps(candidate, ranges[i])) {
				setDraft((prev) => ({
					...prev,
					[idx]: { ...prev[idx], error: "This range overlaps another range." } as DraftRow,
				}));
				return;
			}
		}

		// Apply update + normalize (merge adjacent/overlapping)
		const next = ranges.map((r, i) => (i === idx ? candidate : r));
		const merged = normalizeRanges(next);

		onChange(merged);

		// Reset drafts to reflect merged state (simple: clear all drafts)
		setDraft({});
	};

	return (
		<div className="space-y-3 overflow-auto h-full">
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium text-zinc-200">Free time ranges</div>
				<button
					type="button"
					onClick={addRange}
					className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm hover:bg-zinc-900"
				>
					+ Add range
				</button>
			</div>

			{ranges.length === 0 ? (
				<div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-3 text-sm text-zinc-400">
					No ranges yet. Add one, or use “All day” / “Evening”.
				</div>
			) : (
				<div className="space-y-2">
					{rows.map(({ idx, startText, endText, dirty, error }) => (
						<div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-3">
							<div className="flex flex-wrap items-end gap-3">
								<div className="flex gap-4">
									<div className="flex space-x-2 items-center">
										<label className="text-xs text-zinc-400">Start</label>
										<input
											className="w-16 cursor-text block rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200"
											type="text"
											inputMode="numeric"
											placeholder="HH:MM"
											value={startText}
											onChange={(e) => setDraftField(idx, "startText", e.target.value)}
										/>
									</div>

									<div className="flex space-x-2 items-center">
										<label className="text-xs text-zinc-400">End</label>
										<input
											className="w-16 cursor-text block rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200"
											type="text"
											inputMode="numeric"
											placeholder="HH:MM"
											value={endText}
											onChange={(e) => setDraftField(idx, "endText", e.target.value)}
										/>
									</div>
								</div>

								<div className="ml-auto flex items-center gap-2">
									<button
										type="button"
										onClick={() => removeAt(idx)}
										className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
									>
										Remove
									</button>

									<button
										type="button"
										onClick={() => cancelRow(idx)}
										disabled={!dirty}
										className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900 disabled:opacity-40"
									>
										Cancel
									</button>

									<button
										type="button"
										onClick={() => saveRow(idx)}
										disabled={!dirty}
										className="cursor-pointer rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-950 hover:bg-white disabled:opacity-40"
									>
										Save range
									</button>
								</div>
							</div>

							{error ? (
								<div className="mt-2 text-xs text-red-200">{error}</div>
							) : (
								<div className="mt-2 text-[11px] text-zinc-500">
									Tip: type times as HH:MM and click “Save range”. Overlaps are checked on save.
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
