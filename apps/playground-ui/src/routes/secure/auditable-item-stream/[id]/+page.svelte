<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import AuditableItemStreamProperties from '$components/auditableItemStream/auditableItemStreamProperties.svelte';
</script>

<AuditableItemStreamProperties itemId={page.params.id} />
