<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import TelemetryMetricValueList from '$components/telemetry/telemetryMetricValueList.svelte';
</script>

<TelemetryMetricValueList itemId={page.params.id} />
