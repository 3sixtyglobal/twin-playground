<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import {
		Button,
		Heading,
		i18n,
		Icons,
		Spinner,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		ModalYesNo,
		Pagination
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import type { IUserNftEntry } from '$models/IUserNftEntry';
	import { nftBurn } from '$stores/nft';
	import { nftEntryList, nftsEntryRemove } from '$stores/nfts';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	const cursorHandler = new CursorStackHandler();

	let items: IUserNftEntry[] | undefined = $state();
	let busy = $state(false);
	let status = $state('');
	let isError = $state(false);
	let confirmationId: string = $state('');
	let modalIsBusy = $state(false);

	let canGoBackwards = $derived(cursorHandler.canGoBackwards());
	let canGoForwards = $derived(cursorHandler.canGoForwards());

	async function loadData(): Promise<void> {
		status = $i18n('pages.nft.loading');
		busy = true;
		isError = false;
		const result = await nftEntryList(cursorHandler.getCurrentCursor());

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			items = result?.items ?? [];
			cursorHandler.updateCursor(result?.cursor);

			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();

			if (items.length === 0) {
				status = $i18n('pages.nft.noItems');
			} else {
				status = '';
			}
		}
		busy = false;
	}

	async function loadPrevious(): Promise<void> {
		cursorHandler.goBackwards();
		await loadData();
	}

	async function loadNext(): Promise<void> {
		cursorHandler.goForwards();
		await loadData();
	}

	async function removePrompt(id: string): Promise<void> {
		confirmationId = id;
	}

	async function removeCancel(): Promise<void> {
		confirmationId = '';
		modalIsBusy = false;
	}

	async function remove(): Promise<void> {
		if (Is.stringValue(confirmationId)) {
			modalIsBusy = true;
			await nftBurn(confirmationId);
			await nftsEntryRemove(confirmationId);
			await loadData();
			confirmationId = '';
			modalIsBusy = false;
		}
	}

	onMount(async () => {
		await loadData();
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4">{$i18n('pages.nft.title')}</Heading>
	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Button onclick={() => goto('/secure/nft/mint')} disabled={busy}
			>{$i18n('pages.nft.mintItem')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(items)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.nftProperties.nftId')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.nftProperties.tag')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.nftProperties.issuer')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.nftProperties.owner')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each items as item}
					<TableBodyRow>
						<TableBodyCell wrap>{item.nftId}</TableBodyCell>
						<TableBodyCell>{item.tag}</TableBodyCell>
						<TableBodyCell wrap>{item.issuer}</TableBodyCell>
						<TableBodyCell wrap>{item.owner}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button size="xs" color="plain" onclick={() => goto(`/secure/nft/${item.id}`)}>
								<Icons.EyeOutline />
							</Button>
							<Button
								size="xs"
								color="plain"
								onclick={() => goto(`/secure/nft/${item.id}/transfer`)}
							>
								<Icons.ArrowRightOutline />
							</Button>
							<Button size="xs" color="plain" onclick={async () => removePrompt(item.id)}>
								<Icons.TrashBinOutline />
							</Button>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
		<ModalYesNo
			title={$i18n('pages.nft.deleteTitle')}
			open={Is.stringValue(confirmationId)}
			message={$i18n('pages.nft.deleteMessage')}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{/if}
</section>
