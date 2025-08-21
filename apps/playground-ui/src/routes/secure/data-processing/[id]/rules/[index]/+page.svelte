<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import { Coerce } from '@twin.org/core';
	import DataProcessingRuleGroupRuleProperties from '$components/data-processing/dataProcessingRuleGroupRuleProperties.svelte';
</script>

<DataProcessingRuleGroupRuleProperties
	returnUrl={`/secure/data-processing/${$page.params.id}/rules`}
	itemId={$page.params.id ?? ''}
	ruleIndex={Coerce.number($page.params.index)}
/>
