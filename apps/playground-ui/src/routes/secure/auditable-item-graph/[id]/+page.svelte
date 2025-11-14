<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import AuditableItemGraphProperties from '$components/auditableItemGraph/auditableItemGraphProperties.svelte';
</script>

<AuditableItemGraphProperties itemId={page.params.id} returnUrl="/secure/auditable-item-graph" />
