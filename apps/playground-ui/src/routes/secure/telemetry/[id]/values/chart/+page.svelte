<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import TelemetryMetricValueChart from '$components/telemetry/telemetryMetricValueChart.svelte';
</script>

<TelemetryMetricValueChart itemId={page.params.id ?? ''} />
