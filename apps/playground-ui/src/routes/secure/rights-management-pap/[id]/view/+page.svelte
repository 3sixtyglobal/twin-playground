<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import RightsManagementPapView from '$components/rightsManagementPap/rightsManagementPapView.svelte';
</script>

<RightsManagementPapView
	returnUrl={page.url.searchParams.get('returnUrl') ?? '/secure/rights-management-pap'}
	itemId={page.params.id ?? ''}
/>
