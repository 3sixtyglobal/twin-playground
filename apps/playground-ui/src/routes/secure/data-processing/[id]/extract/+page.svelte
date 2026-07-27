<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import DataProcessingExtractView from '$components/data-processing/dataProcessingExtractView.svelte';
</script>

<DataProcessingExtractView returnUrl="/secure/data-processing" itemId={page.params.id ?? ''} />
