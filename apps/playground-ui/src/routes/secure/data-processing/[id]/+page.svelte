<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import DataProcessingRuleGroupProperties from '$components/data-processing/dataProcessingRuleGroupProperties.svelte';
</script>

<DataProcessingRuleGroupProperties returnUrl="/secure/data-processing" itemId={page.params.id} />
