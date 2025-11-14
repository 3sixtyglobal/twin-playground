<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Is } from '@twin.org/core';
	import type { IRule, IRuleGroup } from '@twin.org/data-processing-models';
	import {
		Button,
		Heading,
		i18n,
		Icons,
		ModalYesNo,
		P,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import { ruleGroupGet, ruleGroupSet } from '$stores/dataProcessing';

	interface Props {
		itemId: string;
		returnUrl: string;
	}

	let { itemId, returnUrl }: Props = $props();

	let ruleGroup: IRuleGroup | undefined = $state();
	let rules: IRule[] | undefined = $state();
	let busy = $state(false);
	let status = $state('');
	let isError = $state(false);
	let confirmationIndex: number = $state(-1);
	let modalIsBusy = $state(false);

	async function loadData(loadId: string): Promise<void> {
		status = $i18n('pages.dataProcessingRuleGroupRuleList.loading');
		busy = true;
		isError = false;
		const result = await ruleGroupGet(loadId);

		if (Is.stringValue(result?.error)) {
			isError = true;
			status = result.error;
		} else if (Is.object(result?.item)) {
			ruleGroup = result.item;
			rules = result.item.rules;

			if (rules.length === 0) {
				status = $i18n('pages.dataProcessingRuleGroupRuleList.noItems');
			} else {
				status = '';
			}
		}
		busy = false;
	}

	async function removePrompt(index: number): Promise<void> {
		confirmationIndex = index;
	}

	async function removeCancel(): Promise<void> {
		confirmationIndex = -1;
		modalIsBusy = false;
	}

	async function remove(): Promise<void> {
		if (confirmationIndex > -1 && Is.object(ruleGroup) && Is.arrayValue(rules)) {
			modalIsBusy = true;
			rules.splice(confirmationIndex, 1);
			rules = rules.slice();
			await ruleGroupSet({
				...ruleGroup,
				rules
			});
			modalIsBusy = false;
			confirmationIndex = -1;
		}
	}

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			await loadData(itemId);
		}
	});
</script>

<section class="flex flex-col items-start justify-center gap-5">
	<Heading tag="h4"
		>{$i18n('pages.dataProcessingRuleGroupRuleList.title')}: {ruleGroup?.label}</Heading
	>
	<div class="items-left flex flex-col justify-end gap-2 sm:w-full sm:flex-row sm:items-center">
		<div class="flex flex-row gap-2">
			{#if busy}
				<Spinner />
			{/if}
		</div>
	</div>

	<div class="flex w-full justify-end gap-4">
		<Button
			class="w-50"
			onclick={() => goto(`/secure/data-processing/${itemId}/rules/create`)}
			disabled={busy}>{$i18n('pages.dataProcessingRuleGroupRuleList.createRule')}</Button
		>
	</div>

	{#if Is.stringValue(status)}
		<P class={isError ? 'text-red-600' : ''}>{status}</P>
	{/if}

	{#if Is.arrayValue(rules)}
		<Table>
			<TableHead>
				<TableHeadCell>{$i18n('pages.dataProcessingRuleGroupRuleList.source')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.dataProcessingRuleGroupRuleList.target')}</TableHeadCell>
				<TableHeadCell>{$i18n('pages.dataProcessingRuleGroupRuleList.actions')}</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each rules as item, idx}
					<TableBodyRow>
						<TableBodyCell wrap>{item.source}</TableBodyCell>
						<TableBodyCell wrap>{item.target}</TableBodyCell>
						<TableBodyCell class="flex flex-row gap-2">
							<Button
								size="xs"
								color="plain"
								onclick={() =>
									goto(`/secure/data-processing/${encodeURIComponent(itemId)}/rules/${idx}`)}
								><Icons.EditOutline /></Button
							><Button size="xs" color="plain" onclick={async () => removePrompt(idx)}
								><Icons.TrashBinOutline /></Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<ModalYesNo
			title={$i18n('pages.dataProcessingRuleGroupRuleList.deleteTitle')}
			open={confirmationIndex > -1}
			message={$i18n('pages.dataProcessingRuleGroupRuleList.deleteMessage')}
			busy={modalIsBusy}
			yesColor="error"
			yesAction={async () => remove()}
			noAction={async () => removeCancel()}
		/>
	{/if}
	<div class="flex flex-row gap-2">
		<Button onclick={() => goto(returnUrl)}>{$i18n('actions.back')}</Button>
	</div>
</section>
