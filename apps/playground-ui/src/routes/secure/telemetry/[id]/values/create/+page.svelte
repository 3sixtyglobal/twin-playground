<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import TelemetryMetricValueProperties from '$components/telemetry/telemetryMetricValueProperties.svelte';
</script>

<TelemetryMetricValueProperties
	itemId={page.params.id}
	returnUrl={`/secure/telemetry/${page.params.id}/values`}
/>
