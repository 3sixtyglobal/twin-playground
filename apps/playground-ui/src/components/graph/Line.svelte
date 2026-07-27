<script lang="ts">
	import * as d3 from 'd3';

	let { stats, xAccessorScaled, yAccessorScaled } = $props();

	const interpolation = d3.curveMonotoneX;

	let lineGenerator = $derived(
		d3.line().x(xAccessorScaled).y(yAccessorScaled).curve(interpolation)
	);

	let line = $derived(lineGenerator(stats));
</script>

<path class="line" d={line} />

<style>
	.line {
		fill: none;
		stroke: #4427ca;
		stroke-width: 3px;
		stroke-linecap: round;
	}
</style>
