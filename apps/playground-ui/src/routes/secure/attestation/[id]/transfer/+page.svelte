<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import AttestationTransfer from '$components/attestation/attestationTransfer.svelte';
</script>

<AttestationTransfer itemId={page.params.id} returnUrl="/secure/attestation" />
