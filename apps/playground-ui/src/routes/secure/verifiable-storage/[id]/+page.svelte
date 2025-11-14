<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import VerifiableStorageView from '$components/verifiableStorage/verifiableStorageView.svelte';
</script>

<VerifiableStorageView itemId={page.params.id} />
