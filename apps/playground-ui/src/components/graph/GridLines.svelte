<script lang="ts">
	import * as d3 from 'd3';

	interface Props {
		yScale: d3.ScaleLinear<number, number>;
		innerWidth: number;
		label: string;
	}

	let { yScale, innerWidth, label }: Props = $props();

	const formatTick = d3.format('.2s');

	function numberOfTicks(pixelsAvailable: number, pixelsPerTick: number = 60): number {
		return Math.floor(Math.abs(pixelsAvailable) / pixelsPerTick);
	}

	let [yMin, yMax] = $derived(yScale.range());

	let ticks = $derived(yScale.ticks(numberOfTicks(yMax - yMin)));
</script>

<g>
	{#each ticks as tick}
		<g transform={`translate(0 ${yScale(tick)})`}>
			<line x1={0} x2={innerWidth} stroke="#bdc3c7" stroke-opacity="0.5" />
			<text dx={-10} dy="0.34em" text-anchor="end" fill="#bdc3c7">
				{formatTick(tick)}
			</text>
		</g>
	{/each}
	<text dx={-10} y={-35} dy="0.8em" text-anchor="end" fill="#bdc3c7">
		{label}
	</text>
</g>
