<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import type { IImmutableProof } from '@twin.org/immutable-proof-models';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		Icons,
		Label,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import ImmutableProofReceipt from './immutableProofReceipt.svelte';
	import { immutableProofGet, immutableProofVerify } from '$stores/immutableProof';
	import { createExplorerVerifiableStorageUrl } from '$stores/iota';

	interface Props {
		itemId: string;
		returnUrl: string;
		title?: string | undefined;
	}

	let { itemId, returnUrl, title = undefined }: Props = $props();
	let error: string | undefined = $state();
	let busy = $state(true);
	let immutableProof: IImmutableProof | undefined = $state();
	let verifiedProof: boolean | undefined = $state();
	let failureMessageProof: string | undefined = $state();
	let verifiableStorageId: string | undefined = $state();
	let explorerUrl: string | undefined = $state();

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	onMount(async () => {
		error = '';
		const result = await immutableProofGet(itemId);

		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else {
			immutableProof = result?.item;
			if (immutableProof && Is.stringValue(immutableProof.verifiableStorageId)) {
				verifiableStorageId = immutableProof.verifiableStorageId;
				explorerUrl = createExplorerVerifiableStorageUrl(verifiableStorageId);
			}
		}

		const resultVerify = await immutableProofVerify(itemId);
		verifiedProof = resultVerify?.verified;
		failureMessageProof = resultVerify?.failure;
		busy = false;
	});
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">
			{title ?? $i18n('components.immutableProofView.title')}
		</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	<Error {error} />
	{#if !busy}
		<div class="flex flex-row justify-between gap-5">
			<div class="flex flex-col gap-4 overflow-hidden">
				<Label>
					{$i18n('components.immutableProofView.id')}
					<Span>{itemId}</Span>
				</Label>
				{#if verifiableStorageId && explorerUrl}
					<div>
						<Button
							size="xs"
							onclick={() => window.open(explorerUrl, '_blank')}
							color="plain"
							class="gap-2"
						>
							{$i18n('components.immutableProofView.explorer')}<Icons.LinkOutline size="sm" />
						</Button>
					</div>
				{/if}
				{#if Is.boolean(verifiedProof) && verifiedProof}
					<Label>
						{$i18n('components.immutableProofView.verified')}
						<Icons.CheckOutline />
					</Label>
				{/if}
				{#if Is.stringValue(failureMessageProof)}
					<Label>
						{$i18n('components.immutableProofView.failure')}
						<Span class="flex"
							><Icons.ExclamationCircleOutline class="mr-2" /> {failureMessageProof}</Span
						>
					</Label>
				{/if}
				{#if !Is.empty(immutableProof)}
					<Label>
						{$i18n('components.immutableProofView.proof')}
						<Code>{JSON.stringify(immutableProof, null, 2)}</Code>
					</Label>
				{/if}
				{#if !Is.empty(immutableProof?.immutableReceipt)}
					<ImmutableProofReceipt item={immutableProof.immutableReceipt} />
				{/if}
			</div>
		</div>
	{/if}
	<div class="flex flex-row justify-start gap-5">
		<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
	</div>
</Card>
