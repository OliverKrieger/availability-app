import { useMemo } from "react";
import { hhmmToMins, minsToHHmm, normalizeRanges } from "../../utility/lib/time";

export type TimeRange = { startMins: number; endMins: number };

type Props = {
	ranges: TimeRange[];
	onChange: (next: TimeRange[]) => void;
};

export function TimeRangeEditor({ ranges, onChange }: Props) {
	const normalized = useMemo(() => normalizeRanges(ranges), [ranges]);

	const updateAt = (idx: number, patch: Partial<TimeRange>) => {
		const next = normalized.map((r, i) => (i === idx ? { ...r, ...patch } : r));
		onChange(next);
	};

	const removeAt = (idx: number) => {
		const next = normalized.filter((_, i) => i !== idx);
		onChange(next);
	};

	const addRange = () => {
		// If there are existing ranges, add a new one after the last range ends.
		const last = normalized[normalized.length - 1];

		const start = last ? Math.min(last.endMins + 30, 23 * 60) : 18 * 60;
		const end = Math.min(start + 120, 24 * 60);

		// If we're too close to end-of-day, fall back to an earlier default
		const safe =
			end > start
				? { startMins: start, endMins: end }
				: { startMins: 16 * 60, endMins: 18 * 60 };

		onChange([...normalized, safe]);
	};

	return (
		<div className="space-y-3">
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

			{normalized.length === 0 ? (
				<div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-3 text-sm text-zinc-400">
					No ranges yet. Add one, or use “All day” / “Evening”.
				</div>
			) : (
				<div className="space-y-2">
					{normalized.map((r, idx) => (
						<div
							key={idx}
							className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/20 p-3"
						>
							<label className="text-xs text-zinc-400">Start</label>
							<input
								className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200"
								type="time"
								value={minsToHHmm(r.startMins)}
								onChange={(e) => {
									const mins = hhmmToMins(e.target.value);
									if (mins == null) return;
									updateAt(idx, { startMins: mins });
								}}
							/>

							<label className="ml-2 text-xs text-zinc-400">End</label>
							<input
								className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200"
								type="time"
								value={minsToHHmm(r.endMins)}
								onChange={(e) => {
									const mins = hhmmToMins(e.target.value);
									if (mins == null) return;
									updateAt(idx, { endMins: mins });
								}}
							/>

							<div className="ml-auto flex items-center gap-2">
								<button
									type="button"
									onClick={() => removeAt(idx)}
									className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
								>
									Remove
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			<div className="text-xs text-zinc-500">
				Ranges auto-merge if they overlap. Invalid ranges are ignored.
			</div>
		</div>
	);
}
