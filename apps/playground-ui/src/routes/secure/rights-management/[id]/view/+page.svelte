<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/stores';
	import RightsManagementView from '$components/rightsManagement/rightsManagementView.svelte';
</script>

<RightsManagementView
	returnUrl={$page.url.searchParams.get('returnUrl') ?? '/secure/rights-management'}
	itemId={$page.params.id ?? ''}
/>
