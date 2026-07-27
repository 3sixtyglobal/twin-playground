<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import DocumentExtract from '$components/document/documentExtract.svelte';
</script>

<DocumentExtract itemId={page.params.id} />
