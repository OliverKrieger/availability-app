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
		// default: 18:00-20:00
		const next = [...normalized, { startMins: 18 * 60, endMins: 20 * 60 }];
		onChange(next);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium text-zinc-200">Free time ranges</div>
				<button
					type="button"
					onClick={addRange}
					className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm hover:bg-zinc-900"
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
								className="w-28 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200"
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
								className="w-28 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200"
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
									className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
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
