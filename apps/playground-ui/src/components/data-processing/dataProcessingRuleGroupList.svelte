<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import type { IRuleGroup } from '@twin.org/data-processing-models';
	import {
		Heading,
		i18n,
		Spinner,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Pagination,
		Label,
		Input,
		Button,
		Card,
		Icons,
		ModalYesNo
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { ruleGroupQuery, ruleGroupRemove } from '$stores/dataProcessing';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	const cursorHandler = new CursorStackHandler();

	let entities: IRuleGroup[] | undefined;
	let busy = false;
	let status = '';
	let limit = 50;
	let isError = false;
	let confirmationId: string = '';
	let modalIsBusy = false;

	$: canGoBackwards = cursorHandler.canGoBackwards();
	$: canGoForwards = cursorHandler.canGoForwards();

	async function loadData(): Promise<void> {
		status = $i18n('pages.dataProcessingRuleGroupList.loading');
		busy = true;
		isError = false;
		const result = await ruleGroupQuery(cursorHandler.getCurrentCursor(), limit);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			entities = result?.entities ?? [];
			cursorHandler.updateCursor(result?.cursor);

			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();

			if (entities.length === 0) {
				status = $i18n('pages.dataProcessingRuleGroupList.noItems');
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

	async function action(): Promise<void> {
		cursorHandler.reset();
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
			await ruleGroupRemove(confirmationId);
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
	<Heading tag="h4">{$i18n('pages.dataProcessingRuleGroupList.title')}</Heading>

	<Card
		class="flex w-full max-w-full flex-row justify-between rounded-lg border border-gray-300 p-4"
	>
		<div class="flex flex-col gap-4 lg:flex-row">
			<Label>
				{$i18n('pages.dataProcessingRuleGroupList.limit')}
				<Input
					name="limit"
					placeholder={$i18n('pages.dataProcessingRuleGroupList.limit')}
					color="default"
					bind:value={limit}
					disabled={busy}
					type="number"
				></Input>
			</Label>
			<Button on:click={async () => action()} disabled={busy} class="lg:mt-6">
				{$i18n('pages.dataProcessingRuleGroupList.search')}
			</Button>
		</div></Card
	>

	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Button on:click={() => goto('/secure/data-processing/create')} disabled={busy}
			>{$i18n('pages.dataProcessingRuleGroupList.createRuleGroup')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(entities)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.dataProcessingRuleGroupList.id')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.dataProcessingRuleGroupList.label')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.dataProcessingRuleGroupList.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each entities as item}
					<TableBodyRow>
						<TableBodyCell class="whitespace-normal">{item.id}</TableBodyCell>
						<TableBodyCell>{item.label}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button
								size="xs"
								color="plain"
								on:click={() => goto(`/secure/data-processing/${encodeURIComponent(item.id)}`)}
								><Icons.EditOutline /></Button
							><Button
								size="xs"
								color="plain"
								on:click={() =>
									goto(`/secure/data-processing/${encodeURIComponent(item.id)}/rules`)}
								><Icons.ListOutline /></Button
							><Button
								size="xs"
								color="plain"
								on:click={() =>
									goto(`/secure/data-processing/${encodeURIComponent(item.id)}/extract`)}
								><Icons.ArrowRightAltOutline /></Button
							><Button size="xs" color="plain" on:click={async () => removePrompt(item.id)}
								><Icons.TrashBinOutline /></Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
		<ModalYesNo
			title={$i18n('pages.dataProcessingRuleGroupList.deleteTitle')}
			open={Is.stringValue(confirmationId)}
			message={$i18n('pages.dataProcessingRuleGroupList.deleteMessage')}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{/if}
</section>
