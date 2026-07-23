<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import type { EntityCondition } from '@twin.org/entity';
	import type { IRightsManagementPolicy } from '@twin.org/rights-management-models';
	import { OdrlPolicyType as PolicyType } from '@twin.org/standards-w3c-odrl';
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

	let items: IRightsManagementPolicy[] | undefined = $state();
	let busy = $state(false);
	let status = $state('');
	let isError = $state(false);
	let confirmationId: string = $state('');
	let modalIsBusy = $state(false);
	let policyType: string | undefined = $state(undefined);
	let limit = $state(10);

	let canGoBackwards = $derived(cursorHandler.canGoBackwards());
	let canGoForwards = $derived(cursorHandler.canGoForwards());
	async function loadData(): Promise<void> {
		status = $i18n('pages.rightsManagement.loading');
		busy = true;
		isError = false;

		let conditions: EntityCondition<IRightsManagementPolicy> | undefined;
		if (policyType && policyType !== 'ALL') {
			conditions = {
				property: '@type',
				value: policyType,
				comparison: 'equals'
			};
		}

		const result = await policyQuery(conditions, cursorHandler.getCurrentCursor(), limit);

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
				{$i18n('pages.rightsManagement.limit')}
				<Input
					name="limit"
					placeholder={$i18n('pages.rightsManagement.limit')}
					color="default"
					bind:value={limit}
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
			<Button class="mt-6 max-w-20" onclick={async () => action()} disabled={busy}>
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
		<Button onclick={() => goto('/secure/rights-management-pap/create')} disabled={busy}
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
						<TableBodyCell wrap>{item['@id']}</TableBodyCell>
						<TableBodyCell>{item['@context']}</TableBodyCell>
						<TableBodyCell>{item['@type']}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2"
							><Button
								size="xs"
								color="plain"
								onclick={() =>
									goto(`/secure/rights-management-pap/${encodeURIComponent(item['@id'])}`)}
								><Icons.EditOutline /></Button
							>
							<Button
								size="xs"
								color="plain"
								onclick={() =>
									goto(`/secure/rights-management-pap/${encodeURIComponent(item['@id'])}/view`)}
							>
								<Icons.EyeOutline />
							</Button>
							<Button size="xs" color="plain" onclick={async () => removePrompt(item['@id'])}>
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
