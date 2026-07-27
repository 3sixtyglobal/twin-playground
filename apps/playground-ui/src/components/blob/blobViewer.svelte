<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is, Converter } from '@twin.org/core';
	import { i18n } from '@twin.org/ui-components-svelte';

	interface Props {
		// Props for the component
		encodingFormat?: string | undefined;
		blob?: string | undefined;
		title?: string | undefined;
		maxHeight?: string;
	}

	let {
		encodingFormat = undefined,
		blob = undefined,
		title = undefined,
		maxHeight = '30vh'
	}: Props = $props();

	// Define content type categories for consistent handling
	const contentTypes = {
		TEXT: 'text',
		IMAGE: 'image',
		PDF: 'pdf',
		OTHER: 'other'
	};

	// Function to determine content type based on encoding format
	function getContentType(format: string | undefined): string {
		if (!Is.stringValue(format)) {
			return contentTypes.OTHER;
		}

		if (format.includes('text') || format.includes('xml') || format.includes('json')) {
			return contentTypes.TEXT;
		} else if (format.includes('image')) {
			return contentTypes.IMAGE;
		} else if (format.includes('pdf')) {
			return contentTypes.PDF;
		}
		return contentTypes.OTHER;
	}

	// Get content type based on encoding format
	let contentType = $derived(getContentType(encodingFormat));

	// Convert base64 to text when needed
	let textContent: string | undefined = $state(undefined);
	$effect(() => {
		if (contentType === contentTypes.TEXT && Is.stringValue(blob)) {
			if (Is.stringBase64(blob)) {
				try {
					textContent = Converter.bytesToUtf8(Converter.base64ToBytes(blob));
				} catch {
					textContent = $i18n('components.blobViewer.invalidTextContent');
				}
			} else {
				textContent = blob;
			}
		} else {
			textContent = undefined;
		}
	});

	// Construct data URL for binary content (images, PDFs)
	let dataUrl = $derived(
		Is.stringValue(encodingFormat) && Is.stringValue(blob)
			? `data:${encodingFormat};base64,${blob}`
			: undefined
	);
</script>

<div
	class="overflow-auto rounded-md border dark:border-neutral-700"
	style="max-height: {maxHeight}"
>
	{#if contentType === contentTypes.TEXT && Is.stringValue(textContent)}
		<pre class="h-full overflow-auto p-4 text-xs">{textContent}</pre>
	{:else if contentType === contentTypes.IMAGE && Is.stringValue(dataUrl)}
		<img src={dataUrl} alt={title ?? 'Image content'} class="h-full w-full object-contain p-2" />
	{:else if contentType === contentTypes.PDF && Is.stringValue(dataUrl)}
		<iframe
			src={dataUrl}
			class="h-full w-full"
			title={title ?? $i18n('components.blobViewer.pdfContent')}
			style="height: {maxHeight}"
		></iframe>
	{:else}
		<div class="flex h-full w-full items-center justify-center p-4">
			{#if !Is.stringValue(blob)}
				<p>{$i18n('components.blobViewer.noBlobData')}</p>
			{:else}
				<p>{$i18n('components.blobViewer.unsupportedFormatInline')}</p>
			{/if}
		</div>
	{/if}
</div>
