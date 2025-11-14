<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import type { IAuditableItemGraphResource } from '@twin.org/auditable-item-graph-models';
	import type { IValidationFailure } from '@twin.org/core';
	import { Coerce, Is, Validation } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Heading,
		i18n,
		Icons,
		Input,
		Label,
		Modal,
		P,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Textarea,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';

	interface Props {
		items: Omit<IAuditableItemGraphResource, '@context' | 'type'>[];
		busy: boolean;
	}

	let { items = $bindable(), busy }: Props = $props();
	let showModal = $state(false);
	let progress: string | undefined;
	let selectedItem: Omit<IAuditableItemGraphResource, '@context' | 'type'> | undefined = $state();
	let resourceId: string | undefined = $state();
	let validationErrors: {
		[field in 'resourceId' | 'resourceObject']?: IValidationFailure[] | undefined;
	} = $state({});

	let selectedResourceObjectType = $state('');
	let resourceObjectText = $state('');
	const examples: { id: string; resourceObject: IJsonLdNodeObject }[] = [
		{
			id: 'resource1',
			resourceObject: {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				name: 'Q2 2025 Marketing Strategy',
				description:
					'This document outlines the marketing strategy for the second quarter of 2025, focusing on digital campaigns and outreach programs.',
				author: {
					'@type': 'Person',
					name: 'Alice Johnson',
					email: 'alice.johnson@example.com'
				},
				dateCreated: '2025-03-01',
				dateModified: '2025-03-15'
			}
		}
	];

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		if (Is.stringValue(resourceId)) {
			Validation.stringValue(
				'resourceId',
				resourceId,
				validationFailures,
				$i18n('pages.auditableItemGraphResourceList.resourceId')
			);
		}

		Validation.json(
			'resourceObject',
			resourceObjectText,
			validationFailures,
			$i18n('pages.auditableItemGraphResourceList.resourceObject')
		);
	}

	function removeItem(index: number): void {
		items.splice(index, 1);
		items = items.slice();
	}

	$effect(() => {
		const example = examples.find(ex => ex.resourceObject['@type'] === selectedResourceObjectType);
		if (example) {
			resourceObjectText = JSON.stringify(example.resourceObject, null, 2);
			resourceId = example.id;
		}
	});

	async function openModal(index: number = -1): Promise<void> {
		showModal = true;
		if (index >= 0) {
			selectedItem = items[index];
			resourceId = selectedItem.id;
			selectedResourceObjectType = '';
			resourceObjectText = JSON.stringify(selectedItem.resourceObject, null, 2);
		} else {
			selectedResourceObjectType = '';
			selectedItem = undefined;
			resourceId = undefined;
			resourceObjectText = '';
		}
	}

	async function action(): Promise<string | undefined> {
		showModal = false;
		if (Is.object(selectedItem)) {
			selectedItem.id = resourceId ?? selectedItem.id;
			selectedItem.resourceObject = Coerce.object(resourceObjectText);
		} else if (Is.stringValue(resourceId)) {
			items.push({
				id: resourceId,
				resourceObject: Coerce.object(resourceObjectText)
			});
		}
		items = items.slice();
		selectedItem = undefined;
		return '';
	}

	async function cancelModal(): Promise<void> {
		showModal = false;
	}
</script>

<div class="flex flex-row justify-between gap-5">
	<Heading tag="h5">{$i18n('pages.auditableItemGraphResourceList.title')}</Heading>
	<Button onclick={async () => openModal()} size="sm" class="whitespace-nowrap" disabled={busy}>
		<Icons.PlusOutline class="mr-2" />
		{$i18n('pages.auditableItemGraphResourceList.addItem')}
	</Button>
</div>
{#if Is.arrayValue(items)}
	<Table>
		<TableHead>
			<TableHeadCell>{$i18n('pages.auditableItemGraphResourceList.resourceId')}</TableHeadCell>
			<TableHeadCell>{$i18n('pages.auditableItemGraphResourceList.resourceObject')}</TableHeadCell>
			<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each items as item, index}
				<TableBodyRow>
					<TableBodyCell wrap>
						{item.id}
					</TableBodyCell>
					<TableBodyCell>{item.resourceObject?.['@type'] ?? ''}</TableBodyCell>
					<TableBodyCell
						><div class="flex gap-2">
							<Button size="xs" color="plain" onclick={async () => openModal(index)} disabled={busy}
								><Icons.EditOutline /></Button
							>
							<Button
								size="xs"
								color="plain"
								onclick={async () => removeItem(index)}
								disabled={busy}><Icons.TrashBinOutline /></Button
							>
						</div></TableBodyCell
					>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{:else}
	<Label>
		{$i18n('pages.auditableItemGraphResourceList.noItems')}
	</Label>
{/if}

<Modal
	open={showModal}
	title={$i18n(`pages.auditableItemGraphResourceList.title${selectedItem ? 'Update' : 'Add'}`)}
>
	<ValidatedForm
		title={''}
		actionButtonLabel={$i18n(
			`pages.auditableItemGraphResourceList.action${selectedItem ? 'Update' : 'Add'}`
		)}
		actionSuccessLabel={$i18n('pages.auditableItemGraphResourceList.actionSuccess')}
		validationMethod={validate}
		actionMethod={action}
		closeMethod={cancelModal}
		class="w-full max-w-none border-0"
		bind:validationErrors
	>
		{#snippet fields()}
			<Label>
				{$i18n('pages.auditableItemGraphResourceList.resourceId')}
				<Input
					type="text"
					name="resourceId"
					color={Is.arrayValue(validationErrors.resourceId) ? 'error' : 'default'}
					bind:value={resourceId}
				/>
				<ValidationError validationErrors={validationErrors.resourceId} />
			</Label>
			<Label>
				{$i18n('pages.auditableItemGraphResourceList.resourceObject')}
				<Textarea
					bind:value={resourceObjectText}
					class="min-h-40 text-xs"
					color={Is.arrayValue(validationErrors.resourceObject) ? 'error' : 'default'}
				/>
				<ValidationError validationErrors={validationErrors.resourceObject} />
			</Label>
			<Label>
				{$i18n('pages.auditableItemGraphResourceList.selectExample')}
				<Select bind:value={selectedResourceObjectType}>
					{#each examples as example}
						<option value={example.resourceObject['@type']}
							>{example.resourceObject['@type']}</option
						>
					{/each}
				</Select>
			</Label>
		{/snippet}
		{#snippet afterAction()}
			{#if Is.stringValue(progress)}
				<P>{progress}</P>
			{/if}
		{/snippet}
	</ValidatedForm>
</Modal>
