<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import DataProcessingRuleGroupRuleList from '$components/data-processing/dataProcessingRuleGroupRuleList.svelte';
</script>

<DataProcessingRuleGroupRuleList
	itemId={$page.params.id ?? ''}
	returnUrl="/secure/data-processing/"
/>
