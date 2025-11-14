<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import RightsManagementPapProperties from '$components/rightsManagementPap/rightsManagementPapProperties.svelte';
</script>

<RightsManagementPapProperties itemId={page.params.id} returnUrl="/secure/rights-management-pap" />
