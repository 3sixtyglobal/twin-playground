<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Converter, Is, ObjectHelper, Urn } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Card,
		Error,
		Heading,
		i18n,
		Icons,
		Label,
		QR,
		Span,
		Spinner,
		Tooltip,
		Clipboard
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import ImmutableProofReceipt from '$components/immutableProof/immutableProofReceipt.svelte';
	import { createPrivateUrl } from '$stores/app';
	import { createExplorerVerifiableStorageUrl } from '$stores/iota';
	import { verifiableStorageGet } from '$stores/verifiableStorage';

	interface Props {
		itemId?: string | undefined;
	}

	let { itemId = undefined }: Props = $props();
	let receipt: IJsonLdNodeObject | undefined = $state();
	let description: string | undefined = $state();
	let error: string | undefined = $state();
	let includeText: string | undefined = $state();
	let busy = $state(true);
	let exploreUrl: string | undefined = $state(undefined);

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			error = '';
			const result = await verifiableStorageGet(itemId);

			if (Is.stringValue(result?.error)) {
				error = result.error;
			} else {
				receipt = result?.receipt;
				description = ObjectHelper.propertyGet(receipt, 'receipt');
				const storedData = ObjectHelper.propertyGet(result, 'data');

				if (Is.uint8Array(storedData)) {
					includeText = Converter.bytesToUtf8(storedData);
				}

				const urn = Urn.fromValidString(itemId);
				const namespaceMethod = urn.namespaceMethod();
				if (namespaceMethod === 'iota') {
					exploreUrl = createExplorerVerifiableStorageUrl(itemId);
				}
			}
			busy = false;
		}
	});

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}

	async function copyData(data: string | undefined = undefined): Promise<void> {
		if (!data) {
			return;
		}
		await Clipboard.copy(data);
	}
</script>

<Card class="h-full max-h-full max-w-full gap-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.verifiableStorageView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	{#if !busy}
		<div class="flex flex-col justify-between gap-5">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						{$i18n('pages.verifiableStorageView.id')}
						<Span>{itemId}</Span>
					</Label>
					{#if Is.stringValue(description)}
						<Label>
							{$i18n('pages.verifiableStorageView.description')}
							<Span>{description}</Span>
						</Label>
					{/if}
					{#if Is.stringValue(exploreUrl)}
						<Label>
							<Button size="xs" onclick={openExplorer} color="plain" class="max-w-32 gap-2"
								>{$i18n('pages.verifiableStorageView.explore')}<Icons.LinkOutline
									size="sm"
								/></Button
							>
						</Label>
					{/if}
				</div>
				<QR
					qrData={createPrivateUrl(`verifiable-storage/${itemId}`)}
					label={$i18n('pages.verifiableStorage.qr')}
					dimensions={128}
				/>
			</div>
		</div>
		{#if Is.stringValue(includeText)}
			<div class="flex h-full w-full flex-col gap-2">
				<div class="flex flex-row justify-between align-bottom">
					<Heading tag="h5">{$i18n('pages.verifiableStorageView.content')}</Heading>
					<div class="flex flex-row gap-3">
						<Button size="xs" color="plain" onclick={async () => copyData(includeText)}>
							<Icons.ClipboardListOutline />
						</Button>
						<Tooltip>{$i18n('pages.verifiableStorage.copyDataClipboard')}</Tooltip>
					</div>
				</div>
				<div class="h-full w-full rounded-md border dark:border-neutral-700">
					<pre class="h-full w-full overflow-auto p-2 text-xs">{includeText}</pre>
				</div>
			</div>
		{/if}
		{#if !Is.empty(receipt)}
			<ImmutableProofReceipt item={receipt} />
		{/if}

		<Error {error} />
	{/if}
	<div class="flex flex-row gap-2">
		<Button onclick={() => goto('/secure/verifiable-storage')}>{$i18n('actions.back')}</Button>
	</div>
</Card>
