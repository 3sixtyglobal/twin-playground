<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is, ObjectHelper } from '@twin.org/core';
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
		Spinner
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import BlobViewer from './blobViewer.svelte';
	import { createPrivateUrl } from '$stores/app';
	import { blobStorageGet, createDownloadLink } from '$stores/blobStorage';

	interface Props {
		itemId?: string | undefined;
	}

	let { itemId = undefined }: Props = $props();
	let encodingFormat: string | undefined = $state();
	let fileExtension: string | undefined = $state();
	let metadata: IJsonLdNodeObject | undefined;
	let description: string | undefined = $state();
	let blobInlineUrl: string = $state('');
	let blobDownloadUrl: string;
	let error: string | undefined = $state();
	let blobData: string | undefined = $state();
	let busy = $state(true);

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			error = '';
			const result = await blobStorageGet(itemId, false);
			if (Is.stringValue(result?.error)) {
				error = result.error;
			} else {
				encodingFormat = result?.data?.encodingFormat;
				fileExtension = result?.data?.fileExtension;
				metadata = result?.data?.metadata;
				blobDownloadUrl = createDownloadLink(itemId, true);

				description = ObjectHelper.propertyGet(metadata, 'name');

				if (
					Is.stringValue(encodingFormat) &&
					(encodingFormat.includes('text') || encodingFormat.includes('xml'))
				) {
					const resultWithContent = await blobStorageGet(itemId, true);
					if (Is.stringValue(resultWithContent?.data?.blob)) {
						blobData = resultWithContent?.data?.blob;
					}
				} else {
					blobInlineUrl = createDownloadLink(itemId, false);

					// Get blob data for viewing with BlobViewer component
					const resultWithContent = await blobStorageGet(itemId, true);
					if (Is.stringValue(resultWithContent?.data?.blob)) {
						blobData = resultWithContent?.data?.blob;
					}
				}
			}
			busy = false;
		}
	});

	function downloadDocument(): void {
		const a = document.createElement('a');
		a.href = blobDownloadUrl;
		a.download = description ?? `document.${fileExtension ?? 'bin'}`;
		a.click();
	}
	function openDocument(): void {
		const a = document.createElement('a');
		a.href = blobInlineUrl;
		a.target = '_blank';
		a.click();
	}
</script>

<Card class="h-full max-h-full max-w-full gap-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">{$i18n('pages.blobView.title')}</Heading>
		{#if busy}
			<Spinner />
		{/if}
	</div>
	{#if !busy}
		<div class="flex flex-col justify-between gap-5">
			<div class="flex flex-col justify-between gap-4 md:flex-row">
				<div class="flex flex-col gap-4">
					<Label>
						{$i18n('pages.blobView.id')}
						<Span>{itemId}</Span>
					</Label>
					{#if Is.stringValue(description)}
						<Label>
							{$i18n('pages.blobView.description')}
							<Span>{description}</Span>
						</Label>
					{/if}
				</div>
				<QR
					qrData={createPrivateUrl(`blob/${itemId}`)}
					label={$i18n('pages.identityProfile.qr')}
					dimensions={128}
				/>
			</div>
			{#if Is.stringValue(fileExtension)}
				<Label>
					{$i18n('pages.blobView.fileExtension')}
					<Span>{fileExtension}</Span>
				</Label>
			{/if}
			{#if Is.stringValue(encodingFormat)}
				<Label>
					{$i18n('pages.blobView.encodingFormat')}
					<Span>{encodingFormat}</Span>
				</Label>
			{/if}
		</div>
		{#if Is.stringValue(blobInlineUrl) || Is.stringValue(blobData)}
			<div class="flex h-full w-full flex-col gap-2">
				<div class="flex flex-row justify-between align-bottom">
					<Label class="mt-1">{$i18n('pages.blobView.document')}</Label>
					<div class="flex flex-row gap-3">
						<Button onclick={openDocument} size="xs">
							<Icons.ArrowUpRightFromSquareOutline size="sm" />
						</Button>
						<Button onclick={downloadDocument} size="xs">
							<Icons.DownloadOutline size="sm" />
						</Button>
					</div>
				</div>
				<BlobViewer blob={blobData} {encodingFormat} title={description} maxHeight="50vh" />
			</div>
		{/if}
		<Error {error} />
	{/if}
	<div class="flex flex-row gap-2">
		<Button onclick={() => goto('/secure/blob')}>{$i18n('actions.back')}</Button>
	</div>
</Card>
