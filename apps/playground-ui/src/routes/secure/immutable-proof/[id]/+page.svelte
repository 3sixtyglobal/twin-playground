<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import ImmutableProofView from '$components/immutableProof/immutableProofView.svelte';
</script>

<ImmutableProofView
	returnUrl={$page.url.searchParams.get('returnUrl') ?? '/secure/immutable-proof'}
	itemId={$page.params.id ?? ''}
/>
