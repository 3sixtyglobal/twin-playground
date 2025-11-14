<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type {
		IAuditableItemStream,
		IAuditableItemStreamEntry
	} from '@twin.org/auditable-item-stream-models';
	import { Is } from '@twin.org/core';
	import {
		type IImmutableProofEventBusProofCreated,
		ImmutableProofTopics
	} from '@twin.org/immutable-proof-models';
	import {
		Button,
		Card,
		Error,
		Heading,
		Label,
		QR,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { createPrivateUrl } from '$stores/app';
	import { auditableItemStreamGet } from '$stores/auditableItemStreams';
	import { eventBusSubscribe, eventBusUnsubscribe } from '$stores/eventBus';

	interface Props {
		itemId: string;
		returnUrl?: string | undefined;
	}

	let { itemId, returnUrl = undefined }: Props = $props();
	let error: string | undefined = $state();
	let busy = $state(true);
	let item: IAuditableItemStream | undefined = $state();
	let entries: IAuditableItemStreamEntry[] | undefined = $state();
	let subscriptionId: string | undefined;

	async function loadStream(): Promise<void> {
		error = '';
		const resultVerify = await auditableItemStreamGet(itemId, false, true);
		if (Is.stringValue(resultVerify?.error)) {
			error = resultVerify.error;
		} else if (Is.objectValue(resultVerify?.item)) {
			item = resultVerify.item;
			entries = resultVerify.item?.entries;
		}
		busy = false;
	}

	async function navigateToImmutableProof(proofId: string): Promise<void> {
		const proofIdParts = proofId.split(':');
		await goto(
			`/secure/immutable-proof/immutable-proof:${proofIdParts[1]}?returnUrl=${encodeURIComponent(globalThis.location.pathname)}`
		);
	}

	onMount(async () => {
		await loadStream();

		if (item?.verification?.verified === false) {
			const result = await eventBusSubscribe<IImmutableProofEventBusProofCreated>(
				ImmutableProofTopics.ProofCreated,
				async event => {
					if (event.data.id === item?.proofId) {
						if (Is.stringValue(subscriptionId)) {
							await eventBusUnsubscribe(subscriptionId);
							subscriptionId = undefined;
						}

						await loadStream();
					}
				}
			);

			if (Is.stringValue(result?.error)) {
				error = result.error;
			} else {
				subscriptionId = result?.subscriptionId;
			}
		}
	});

	onDestroy(async () => {
		if (Is.stringValue(subscriptionId)) {
			await eventBusUnsubscribe(subscriptionId);
		}
	});
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('components.auditableItemStreamView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	<Error {error} />
	{#if !busy}
		<div class="flex flex-col justify-between gap-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						{$i18n('components.auditableItemStreamView.id')}
						<Span>{itemId}</Span>
					</Label>
					{#if Is.stringValue(item?.proofId)}
						<Label>
							{$i18n('components.auditableItemStreamView.proofId')}
							<Span>{item.proofId}</Span>
						</Label>
						<div>
							<Button onclick={async () => navigateToImmutableProof(item?.proofId ?? '')}
								>{$i18n('components.auditableItemStreamView.viewProof')}</Button
							>
						</div>
					{/if}
				</div>
				<QR
					qrData={createPrivateUrl(`auditable-item-stream/${itemId}`)}
					label={$i18n('components.auditableItemStreamView.auditableItemStreamQr')}
					dimensions={128}
				/>
			</div>
		</div>
		{#if Is.arrayValue(entries)}
			<Heading tag="h5">{$i18n('components.auditableItemStreamView.entries')}</Heading>
			<div class="flex flex-col gap-4">
				{#each entries as entry}
					<div class="flex flex-col gap-4 rounded-md border p-4">
						<Label>
							{$i18n('components.auditableItemStreamView.entryId')}
							<Span>{entry.id}</Span>
						</Label>
						{#if Is.stringValue(entry.proofId)}
							<Label>
								{$i18n('components.auditableItemStreamView.proofId')}
								<Span>{entry.proofId}</Span>
							</Label>
							<div>
								<Button onclick={async () => navigateToImmutableProof(entry.proofId ?? '')}
									>{$i18n('components.auditableItemStreamView.viewProof')}</Button
								>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</Card>
{#if Is.stringValue(returnUrl)}
	<div class="mt-5 flex flex-row gap-2">
		<Button onclick={() => goto(returnUrl)}>{$i18n('actions.back')}</Button>
	</div>
{/if}
