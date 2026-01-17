import { normalizeRanges, hhmmToMinsStrict, minsToHHmm } from "../../utility/lib/time";

export type TimeRange = { startMins: number; endMins: number };

type Props = {
	ranges: TimeRange[];
	onChange: (next: TimeRange[]) => void;
};

const MIN_GAP = 30;

function overlaps(a: TimeRange, b: TimeRange) {
	return Math.max(a.startMins, b.startMins) < Math.min(a.endMins, b.endMins);
}

function clamp(mins: number) {
	return Math.max(0, Math.min(24 * 60, mins));
}

export function TimeRangeEditor({ ranges, onChange }: Props) {
	const removeAt = (idx: number) => {
		const next = ranges.filter((_, i) => i !== idx);
		onChange(next);
	};

	const addRange = () => {
		const normalized = normalizeRanges(ranges);
		const last = normalized[normalized.length - 1];

		const start = last ? Math.min(last.endMins + 30, 23 * 60) : 18 * 60;
		const end = Math.min(start + 120, 24 * 60);

		const safe = end > start ? { startMins: start, endMins: end } : { startMins: 16 * 60, endMins: 18 * 60 };
		onChange([...ranges, safe]);
	};

	const commitTimeChange = (idx: number, field: "start" | "end", hhmm: string) => {
		const mins = hhmmToMinsStrict(hhmm);
		if (mins == null) return; // should not happen for type="time"

		const current = ranges[idx];
		if (!current) return;

		let start = field === "start" ? mins : current.startMins;
		let end = field === "end" ? mins : current.endMins;

		start = clamp(start);
		end = clamp(end);

		// Auto-adjust to maintain MIN_GAP if inverted or equal
		if (start >= end) {
			if (field === "start") {
				end = clamp(start + MIN_GAP);
				if (end <= start) {
					// If clamped at 24:00 and can't maintain gap, move start back
					start = clamp(end - MIN_GAP);
				}
			} else {
				start = clamp(end - MIN_GAP);
				if (end <= start) {
					end = clamp(start + MIN_GAP);
				}
			}
		}

		// Still invalid after clamp (edge cases near 00:00/24:00)
		if (end <= start) return;

		const candidate: TimeRange = { startMins: start, endMins: end };

		// If the adjustment causes overlap with any other range -> remove this range
		for (let i = 0; i < ranges.length; i++) {
			if (i === idx) continue;
			if (overlaps(candidate, ranges[i])) {
				removeAt(idx);
				return;
			}
		}

		// Apply and normalize/merge (safe now)
		const next = ranges.map((r, i) => (i === idx ? candidate : r));
		onChange(normalizeRanges(next));
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
					{ranges.map((r, idx) => (
						<div
							key={idx}
							className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900/20 p-3"
						>
							<div>
								<label className="text-xs text-zinc-400">Start</label>
								<input
									className="cursor-pointer block rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200"
									type="time"
									step={60}
									value={minsToHHmm(r.startMins)}
									onChange={(e) => commitTimeChange(idx, "start", e.target.value)}
								/>
							</div>

							<div>
								<label className="text-xs text-zinc-400">End</label>
								<input
									className="cursor-pointer block rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200"
									type="time"
									step={60}
									value={minsToHHmm(r.endMins)}
									onChange={(e) => commitTimeChange(idx, "end", e.target.value)}
								/>
							</div>

							<div className="ml-auto flex items-center gap-2">
								<button
									type="button"
									onClick={() => removeAt(idx)}
									className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
								>
									Remove
								</button>
							</div>

							<div className="w-full text-[11px] text-zinc-500">
								Tip: changing start/end auto-adjusts to keep at least {MIN_GAP} minutes.
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
