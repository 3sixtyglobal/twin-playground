<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import AuditableItemStreamEntriesList from '$components/auditableItemStream/auditableItemStreamEntriesList.svelte';
</script>

<AuditableItemStreamEntriesList streamId={$page.params.id ?? ''} />
