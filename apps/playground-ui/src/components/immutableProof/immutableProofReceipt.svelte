<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { Is } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import { Button, Card, Heading, Icons, Label, Span, i18n } from '@twin.org/ui-components-svelte';
	import { createExplorerDigestUrl } from '$stores/iota';

	interface Props {
		item: IJsonLdNodeObject;
	}

	let { item }: Props = $props();

	let exploreUrl: string | undefined = $state();

	if (item.type === 'VerifiableStorageIotaReceipt' && Is.stringValue(item.digest)) {
		exploreUrl = createExplorerDigestUrl(item.digest);
	}

	function openExplorer(): void {
		window.open(exploreUrl, '_blank');
	}
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-col justify-between gap-5">
		<Heading tag="h5">{$i18n('components.immutableProofReceipt.title')}</Heading>
		<div class="flex flex-col gap-4">
			<Label>
				{$i18n('components.immutableProofReceipt.type')}
				<Span>{item.type}</Span>
			</Label>
			{#if item.type === 'VerifiableStorageIotaReceipt'}
				<Label>
					{$i18n('components.immutableProofReceipt.epoch')}
					<Span>{item.epoch}</Span>
				</Label>
				<Label>
					{$i18n('components.immutableProofReceipt.digest')}
					<Span>{item.digest}</Span>
				</Label>
			{:else if item.type === 'VerifiableStorageEntityStorageReceipt'}
				<Label>
					{$i18n('components.immutableProofReceipt.entityStorageId')}
					<Span>{item.entityStorageId}</Span>
				</Label>
			{/if}
			{#if Is.stringValue(exploreUrl)}
				<div>
					<Button size="xs" onclick={openExplorer} color="plain" class="gap-2"
						>{$i18n('components.immutableProofReceipt.explore')}<Icons.LinkOutline
							size="sm"
						/></Button
					>
				</div>
			{/if}
		</div>
	</div>
</Card>
