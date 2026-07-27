<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import AuditableItemStreamView from '$components/auditableItemStream/auditableItemStreamView.svelte';
</script>

<AuditableItemStreamView itemId={page.params.id ?? ''} returnUrl="/secure/auditable-item-stream" />
