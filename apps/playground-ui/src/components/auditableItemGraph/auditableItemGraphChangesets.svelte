<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type { IAuditableItemGraphChangeset } from '@twin.org/auditable-item-graph-models';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		i18n,
		Label,
		Span,
		Spinner
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { auditableItemGraphGet } from '$stores/auditableItemGraphs';

	interface Props {
		itemId: string;
		returnUrl: string;
	}

	let { itemId, returnUrl }: Props = $props();
	let busy = $state(false);
	let error: string | undefined = $state(undefined);
	let changesets: IAuditableItemGraphChangeset[] = $state([]);

	async function navigateToImmutableProof(proofId: string): Promise<void> {
		const proofIdParts = proofId.split(':');
		await goto(
			`/secure/immutable-proof/immutable-proof:${proofIdParts[1]}?returnUrl=${encodeURIComponent(globalThis.location.pathname)}`
		);
	}

	async function loadData(loadId: string): Promise<void> {
		busy = true;
		error = '';

		const result = await auditableItemGraphGet(loadId, true);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else if (Is.objectValue(result?.item)) {
			changesets = result.item.changesets ?? [];
		}

		busy = false;
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	onMount(async () => {
		await loadData(itemId);
	});
</script>

<section class="flex flex-col gap-5">
	<Card class="max-w-full gap-4 pb-4">
		<div class="flex flex-row justify-between gap-5">
			<Heading tag="h5">
				{$i18n('pages.auditableItemGraphChangesets.title')}
			</Heading>
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Label>
			{$i18n('pages.auditableItemGraphChangesets.vertexId')}
			<Span>{itemId}</Span>
		</Label>
		<Error {error} />
	</Card>

	{#if Is.arrayValue(changesets)}
		{#each changesets as changeset, idx}
			<Card class="max-w-full gap-4 pb-4">
				<div class="flex flex-col gap-5">
					<Heading tag="h6">
						{$i18n('pages.auditableItemGraphChangesets.changeset')}
						{idx + 1}
					</Heading>
					<Label>
						{$i18n('pages.auditableItemGraphChangesets.dateCreated')}
						<Span>{new Date(changeset.dateCreated).toLocaleString()}</Span>
					</Label>
					{#if Is.stringValue(changeset.proofId)}
						<Label>
							{$i18n('pages.auditableItemGraphChangesets.proofId')}
							<Span>{changeset.proofId}</Span>
						</Label>
						<div>
							<Button
								size="sm"
								onclick={async () => navigateToImmutableProof(changeset.proofId ?? '')}
							>
								{$i18n('pages.auditableItemGraphChangesets.viewProof')}
							</Button>
						</div>
					{/if}
					<Label>
						{$i18n('pages.auditableItemGraphChangesets.patches')}
						<Code class="h-72 overflow-auto">{JSON.stringify(changeset.patches, null, 2)}</Code>
					</Label>
				</div>
			</Card>
		{/each}
	{:else if !busy}
		{$i18n('pages.auditableItemGraphChangesets.noItems')}
	{/if}
	<div class="flex flex-row justify-start gap-5">
		<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
	</div>
</section>
