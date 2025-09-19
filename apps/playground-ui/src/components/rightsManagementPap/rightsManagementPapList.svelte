<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import type { EntityCondition } from '@twin.org/entity';
	import { type IOdrlPolicy, PolicyType } from '@twin.org/standards-w3c-odrl';
	import {
		Button,
		Card,
		Heading,
		i18n,
		Icons,
		Input,
		Label,
		ModalYesNo,
		P,
		Pagination,
		Select,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { policyRemove, policyQuery } from '$stores/rightsManagementPap';
	import { CursorStackHandler } from '$utils/shared/cursorStackHandler';

	const cursorHandler = new CursorStackHandler();
	const policyTypes = Object.values(PolicyType);

	let items: IOdrlPolicy[] | undefined;
	let busy = false;
	let status = '';
	let isError = false;
	let confirmationId: string = '';
	let modalIsBusy = false;
	let policyType: string | undefined = undefined;
	let pageSize = 10;

	$: canGoBackwards = cursorHandler.canGoBackwards();
	$: canGoForwards = cursorHandler.canGoForwards();
	async function loadData(): Promise<void> {
		status = $i18n('pages.rightsManagement.loading');
		busy = true;
		isError = false;

		let conditions: EntityCondition<IOdrlPolicy> | undefined;
		if (policyType && policyType !== 'ALL') {
			conditions = {
				property: '@type',
				value: policyType,
				comparison: 'equals'
			};
		}

		const result = await policyQuery(conditions, cursorHandler.getCurrentCursor(), pageSize);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else {
			items = result?.policies ?? [];

			cursorHandler.updateCursor(result?.cursor);
			canGoBackwards = cursorHandler.canGoBackwards();
			canGoForwards = cursorHandler.canGoForwards();

			if (items.length === 0) {
				status = $i18n('pages.rightsManagement.noItems');
			} else {
				status = '';
			}
		}
		busy = false;
	}

	async function action(): Promise<void> {
		cursorHandler.reset();

		if (policyType === '') {
			policyType = undefined;
		}

		await loadData();
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
			await policyRemove(encodeURIComponent(confirmationId));
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
	<Heading tag="h4">{$i18n('pages.rightsManagement.title')}</Heading>
	<Card class="w-full max-w-full rounded-lg border border-gray-300 p-4">
		<div class="block flex-row gap-2 lg:flex">
			<Label>
				{$i18n('pages.rightsManagement.pageSize')}
				<Input
					name="pageSize"
					placeholder={$i18n('pages.rightsManagement.pageSize')}
					color="default"
					bind:value={pageSize}
					disabled={busy}
					type="number"
				></Input>
			</Label>
			<Label>
				{$i18n('pages.rightsManagement.policyType')}
				<Select bind:value={policyType} disabled={busy}>
					<option value={undefined}>ALL</option>
					{#each policyTypes as type}
						<option value={type}>{type}</option>
					{/each}
				</Select>
			</Label>
			<Button class="mt-6 max-w-20" on:click={async () => action()} disabled={busy}>
				{$i18n('pages.rightsManagement.search')}
			</Button>
		</div>
	</Card>

	<div class="items-left flex flex-col justify-between gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
		<Button on:click={() => goto('/secure/rights-management-pap/create')} disabled={busy}
			>{$i18n('pages.rightsManagement.createPolicy')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(items)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.rightsManagementProperties.id')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.rightsManagementProperties.context')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.rightsManagementProperties.type')}</TableHeadCell>
				<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each items as item}
					<TableBodyRow>
						<TableBodyCell wrap>{item.uid}</TableBodyCell>
						<TableBodyCell>{item['@context']}</TableBodyCell>
						<TableBodyCell>{item['@type']}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2"
							><Button
								size="xs"
								color="plain"
								on:click={() =>
									goto(`/secure/rights-management-pap/${encodeURIComponent(item.uid)}`)}
								><Icons.EditOutline /></Button
							>
							<Button
								size="xs"
								color="plain"
								on:click={() =>
									goto(`/secure/rights-management-pap/${encodeURIComponent(item.uid)}/view`)}
							>
								<Icons.EyeOutline />
							</Button>
							<Button size="xs" color="plain" on:click={async () => removePrompt(item.uid)}>
								<Icons.TrashBinOutline />
							</Button>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {loadNext} {loadPrevious} {canGoBackwards} {canGoForwards} disabled={busy} />
		<ModalYesNo
			title={$i18n('pages.rightsManagement.deleteTitle')}
			open={Is.stringValue(confirmationId)}
			message={$i18n('pages.rightsManagement.deleteMessage')}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{/if}
</section>
