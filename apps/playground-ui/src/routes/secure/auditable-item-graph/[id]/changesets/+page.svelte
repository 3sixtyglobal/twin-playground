<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import AuditableItemGraphChangesets from '$components/auditableItemGraph/auditableItemGraphChangesets.svelte';
</script>

<AuditableItemGraphChangesets
	itemId={$page.params.id ?? ''}
	returnUrl="/secure/auditable-item-graph"
/>
