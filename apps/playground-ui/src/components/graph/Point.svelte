<script lang="ts">
	let { x, y, color } = $props();
</script>

<g>
	<circle cx={x} cy={y} fill={color} r="5" />
</g>
