<script lang="ts">
	import * as d3 from 'd3';
	import type { ScaleTime } from 'd3-scale';

	interface Props {
		xScale: ScaleTime<number, number>;
		innerHeight: number;
		label: string;
	}

	let { xScale, innerHeight, label }: Props = $props();

	function numberOfTicks(pixelsAvailable: number, pixelsPerTick: number = 80): number {
		return Math.floor(Math.abs(pixelsAvailable) / pixelsPerTick);
	}

	let [xMin, xMax] = $derived(xScale.range());

	let ticks = $derived(xScale.ticks(numberOfTicks(xMax - xMin)));

	const spanMs = $derived(xScale.domain()[1].getTime() - xScale.domain()[0].getTime());
	const formatTick = $derived(
		spanMs > 86_400_000
			? d3.timeFormat('%m/%d %H:%M')
			: spanMs > 3_600_000
				? d3.timeFormat('%H:%M')
				: d3.timeFormat('%H:%M:%S')
	);
</script>

<g transform={`translate(0 ${innerHeight})`}>
	<line x1={xMin} x2={xMax} y1={0} y2={0} stroke="#bdc3c7" />
	{#each ticks as tick}
		<g transform={`translate(${xScale(tick)} 0)`}>
			<line y1={0} y2={6} stroke="#bdc3c7" />
			<text y={10} dy="0.8em" text-anchor="middle" fill="#bdc3c7" font-size="11">
				{formatTick(tick)}
			</text>
		</g>
	{/each}
	<text x={xScale.range()[1] / 2} text-anchor="middle" y={45} fill="#bdc3c7">
		{label}
	</text>
</g>
