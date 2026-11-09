<script lang="ts">
	import type { Dictionary } from '$lib/dictionary/dictionary';

	type Point = [number, number];

	// The width of the medians, should be bigger than the strokes in the stroke data
	const MEDIAN_STROKE_WIDTH = 128;
	const DRAWING_SPEED_UNITS_PER_SECOND = 800;

	const { char, dictionary }: { char: string; dictionary: Dictionary } = $props();
	const id = $props.id();

	const hanzi = $derived(dictionary.lookupHanzi(char));
	let replayCount = $state(0);

	const distance = ([x1, y1]: Point, [x2, y2]: Point): number => Math.hypot(x2 - x1, y2 - y1);

	const lineLength = (points: Point[]): number =>
		points.slice(1).reduce((sum, point, index) => sum + distance(points[index], point), 0);

	const polylinePath = (points: Point[]): string =>
		`M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')}`;

	const animatedStrokes = $derived.by(() => {
		const strokeData = hanzi?.strokeData;
		if (strokeData === undefined) return undefined;

		let delay = 0;
		return strokeData.strokes.map((stroke, index) => {
			const median = strokeData.medians[index];
			const length = lineLength(median);
			const duration = (length + MEDIAN_STROKE_WIDTH) / DRAWING_SPEED_UNITS_PER_SECOND;
			const animationInfo = { stroke, median: polylinePath(median), length, duration, delay };
			delay += duration;
			return animationInfo;
		});
	});
</script>

{#if animatedStrokes !== undefined}
	<button
		type="button"
		class="cursor-pointer rounded-lg"
		aria-label="Play {char} again"
		onclick={() => replayCount++}
	>
		{#key `${char}:${replayCount}`}
			<!-- Adapted from https://github.com/skishore/makemeahanzi/-->
			<svg
				viewBox="0 0 1024 1024"
				xmlns="http://www.w3.org/2000/svg"
				class="size-24 rounded-lg bg-paper-700 text-paper-50 dark:bg-paper-400 dark:text-paper-900"
			>
				<title>{char}</title>
				<g class="helper-lines" stroke-dasharray="1,1" stroke-width="1" transform="scale(4, 4)">
					<line x1="0" y1="0" x2="256" y2="256"></line>
					<line x1="256" y1="0" x2="0" y2="256"></line>
					<line x1="128" y1="0" x2="128" y2="256"></line>
					<line x1="0" y1="128" x2="256" y2="128"></line>
				</g>
				<g
					transform="scale(1, -1) translate(0, -900)"
					style:--median-stroke-width="{MEDIAN_STROKE_WIDTH}px"
				>
					{#each animatedStrokes as stroke, index (index)}
						<path class="glyph-outline" d={stroke.stroke}></path>
						<clipPath id="{id}-clip-{index}">
							<path d={stroke.stroke}></path>
						</clipPath>
						<path
							class="glyph-median"
							d={stroke.median}
							clip-path="url(#{id}-clip-{index})"
							style:--length="{stroke.length}px"
							style:animation-duration="{stroke.duration}s"
							style:animation-delay="{stroke.delay}s"
						></path>
					{/each}
				</g>
			</svg>
		{/key}
	</button>
{:else}
	<h2 class="font-serif text-8xl font-semibold text-paper-900 dark:text-paper-50">
		{char}
	</h2>
{/if}

<style>
	.helper-lines {
		stroke: var(--color-paper-200);
	}

	@media (prefers-color-scheme: dark) {
		.helper-lines {
			stroke: var(--color-paper-800);
		}
	}

	.glyph-outline {
		fill: currentColor;
		opacity: 0.25;
	}

	.glyph-median {
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-width: var(--median-stroke-width);
		stroke-dasharray: var(--length) calc(var(--length) + 2 * var(--median-stroke-width));
		animation-name: draw-stroke;
		animation-timing-function: linear;
		animation-fill-mode: both;
	}

	@keyframes draw-stroke {
		from {
			stroke-dashoffset: calc(var(--length) + var(--median-stroke-width));
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.glyph-median {
			animation-name: none;
			stroke-dashoffset: 0;
		}
	}
</style>
