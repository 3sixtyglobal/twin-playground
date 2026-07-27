<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import TelemetryMetricProperties from '$components/telemetry/telemetryMetricProperties.svelte';
</script>

<TelemetryMetricProperties itemId={page.params.id} returnUrl="/secure/telemetry" />
