<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import type { IOdrlPolicy } from '@twin.org/standards-w3c-odrl';
	import {
		Button,
		Card,
		Code,
		Error,
		Heading,
		Label,
		Span,
		Spinner,
		i18n
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { policyGet } from '$stores/rightsManagementPap';

	interface Props {
		itemId: string;
		returnUrl: string;
		title?: string | undefined;
	}

	let { itemId, returnUrl, title = undefined }: Props = $props();
	let error: string | undefined = $state();
	let busy = $state(true);
	let odrlPolicy: IOdrlPolicy | undefined = $state();

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	onMount(async () => {
		error = '';
		const result = await policyGet(encodeURIComponent(itemId));

		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else {
			odrlPolicy = result?.item;
		}

		busy = false;
	});
</script>

<Card class="max-w-full gap-4 pb-4">
	<div class="flex flex-row justify-between gap-5">
		<Heading tag="h5">
			{title ?? $i18n('components.rightsManagementView.title')}
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
					{$i18n('components.rightsManagementView.id')}
					<Span>{itemId}</Span>
				</Label>
				{#if !Is.empty(odrlPolicy)}
					<Label>
						{$i18n('components.rightsManagementView.policy')}
						<Code>{JSON.stringify(odrlPolicy, null, 2)}</Code>
					</Label>
				{/if}
			</div>
		</div>
	{/if}
	<div class="flex flex-row justify-start gap-5">
		<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
	</div>
</Card>
