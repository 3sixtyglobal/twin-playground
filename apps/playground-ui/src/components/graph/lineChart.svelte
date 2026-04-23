<script lang="ts">
	import * as d3 from 'd3';

	import Crosshair from '$components/graph/Crosshair.svelte';
	import GridLines from '$components/graph/GridLines.svelte';
	import Line from '$components/graph/Line.svelte';
	import Point from '$components/graph/Point.svelte';
	import XAxis from '$components/graph/XAxis.svelte';

	interface Props {
		stats: { ts: string | number | Date; value: number }[];
	}

	let { stats }: Props = $props();

	let hoveredPoint: { ts: string | number | Date; value: number } | null = $state(null);

	const margin = {
		top: 50,
		right: 50,
		bottom: 50,
		left: 90
	};

	let width = $state(200);
	let height = $derived(0.5 * width);

	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	function xAccessor(d: { ts: string | number | Date }): number {
		return new Date(Number(d.ts)).getTime();
	}

	function yAccessor(d: { value: number }): number {
		return d.value;
	}

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const bisectX = d3.bisector(xAccessor).left;

	let xTimestamps = $derived(stats.map(d => Number(d.ts)));
	let xTsMin = $derived(d3.min(xTimestamps) ?? Date.now());
	let xTsMax = $derived(d3.max(xTimestamps) ?? Date.now());
	let xDomainStart = $derived(xTsMin === xTsMax ? new Date(xTsMin - 60_000) : new Date(xTsMin));
	let xDomainEnd = $derived(xTsMin === xTsMax ? new Date(xTsMax + 60_000) : new Date(xTsMax));

	let xScale = $derived(d3.scaleTime().domain([xDomainStart, xDomainEnd]).range([0, innerWidth]));

	let yScale = $derived(
		d3
			.scaleLinear()
			.domain(d3.extent(stats, yAccessor) as [number, number])
			.range([innerHeight, 0])
			.nice()
	);

	let xAccessorScaled = (d: { ts: string | number | Date }): number => xScale(xAccessor(d));

	function yAccessorScaled(d: { value: number }): number {
		return yScale(yAccessor(d));
	}

	function handleMouseMove(event: MouseEvent): void {
		const xCoordinate = xScale.invert(event.offsetX - margin.left);
		const index = bisectX(stats, xCoordinate);
		hoveredPoint = stats[index - 1];
	}

	function handleMouseLeave(): void {
		hoveredPoint = null;
	}
</script>

<div class="wrapper" bind:clientWidth={width}>
	<svg
		role="img"
		aria-label="line chart showing the variation of the provided statistics over time"
		{width}
		{height}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
	>
		<g transform={`translate(${margin.left}, ${margin.top})`}>
			<XAxis {xScale} {innerHeight} label="Ts" />
			<GridLines {yScale} {innerWidth} label="Value" />
			<Line {stats} {xAccessorScaled} {yAccessorScaled} />
			{#if hoveredPoint}
				<Crosshair
					xAccessorScaled={xAccessorScaled(hoveredPoint)}
					yAccessorScaled={yAccessorScaled(hoveredPoint)}
					xLabel={new Date(xAccessor(hoveredPoint)).toLocaleTimeString()}
					yLabel={yAccessor(hoveredPoint)}
					{innerHeight}
				/>
				<Point
					x={xAccessorScaled(hoveredPoint)}
					y={yAccessorScaled(hoveredPoint)}
					color="rgb(255 124 21)"
				/>
			{/if}
		</g>
	</svg>
</div>

<style>
	.wrapper {
		position: relative;
		width: 100%;
		max-width: 900px;
	}
</style>
