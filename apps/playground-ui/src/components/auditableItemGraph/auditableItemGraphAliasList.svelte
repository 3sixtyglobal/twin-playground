<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import {
		AuditableItemGraphTypes,
		type IAuditableItemGraphAlias
	} from '@twin.org/auditable-item-graph-models';
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
		items: Omit<IAuditableItemGraphAlias, '@context'>[];
		busy: boolean;
	}

	let { items = $bindable(), busy }: Props = $props();
	let showModal = $state(false);
	let progress: string | undefined;
	let selectedItem: Omit<IAuditableItemGraphAlias, '@context'> | undefined = $state();
	let aliasId: string | undefined = $state();
	let aliasFormat: string | undefined = $state();
	let validationErrors: {
		[field in 'aliasId' | 'aliasFormat' | 'annotationObject']?: IValidationFailure[] | undefined;
	} = $state({});

	let selectedAnnotationObjectType = $state('');
	let annotationObjectText = $state('');
	const examples: { id: string; aliasFormat: string; annotationObject: IJsonLdNodeObject }[] = [
		{
			id: 'alias1',
			aliasFormat: 'Format A',
			annotationObject: {
				'@context': 'https://schema.org',
				'@type': 'Person',
				name: 'Alias Example 1'
			}
		},
		{
			id: 'alias2',
			aliasFormat: 'Format B',
			annotationObject: {
				'@context': 'https://schema.org',
				'@type': 'Organization',
				name: 'Alias Example 2'
			}
		}
	];

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.stringValue(
			'aliasId',
			aliasId,
			validationFailures,
			$i18n('pages.auditableItemGraphAliasList.aliasId')
		);

		if (Is.stringValue(annotationObjectText)) {
			Validation.json(
				'annotationObject',
				annotationObjectText,
				validationFailures,
				$i18n('pages.auditableItemGraphAliasList.annotationObject')
			);
		}
	}

	function removeItem(index: number): void {
		items.splice(index, 1);
		items = items.slice();
	}

	$effect(() => {
		const example = examples.find(
			ex => ex.annotationObject['@type'] === selectedAnnotationObjectType
		);
		if (example) {
			annotationObjectText = JSON.stringify(example.annotationObject, null, 2);
			aliasId = example.id;
			aliasFormat = example.aliasFormat;
		}
	});

	async function openModal(index: number = -1): Promise<void> {
		showModal = true;
		selectedAnnotationObjectType = '';
		if (index >= 0) {
			selectedItem = items[index];
			aliasId = selectedItem.id;
			aliasFormat = selectedItem.aliasFormat;
			annotationObjectText = JSON.stringify(selectedItem.annotationObject, null, 2);
		} else {
			selectedItem = undefined;
			aliasId = undefined;
			aliasFormat = undefined;
			annotationObjectText = '';
		}
	}

	async function action(): Promise<string | undefined> {
		showModal = false;
		if (Is.object(selectedItem)) {
			selectedItem.id = aliasId ?? selectedItem.id;
			selectedItem.aliasFormat = aliasFormat;
			selectedItem.annotationObject = Coerce.object(annotationObjectText);
		} else if (Is.stringValue(aliasId)) {
			items.push({
				type: AuditableItemGraphTypes.Alias,
				id: aliasId,
				aliasFormat,
				annotationObject: Coerce.object(annotationObjectText)
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
	<Heading tag="h5">{$i18n('pages.auditableItemGraphAliasList.title')}</Heading>
	<Button onclick={async () => openModal()} size="sm" class="whitespace-nowrap" disabled={busy}>
		<Icons.PlusOutline class="mr-2" />
		{$i18n('pages.auditableItemGraphAliasList.addItem')}
	</Button>
</div>
{#if Is.arrayValue(items)}
	<Table>
		<TableHead>
			<TableHeadCell>{$i18n('pages.auditableItemGraphAliasList.aliasId')}</TableHeadCell>
			<TableHeadCell>{$i18n('pages.auditableItemGraphAliasList.aliasFormat')}</TableHeadCell>
			<TableHeadCell>{$i18n('pages.auditableItemGraphAliasList.annotationObject')}</TableHeadCell>
			<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each items as item, index}
				<TableBodyRow>
					<TableBodyCell wrap>
						{item.id}
					</TableBodyCell>
					<TableBodyCell>{item.aliasFormat ?? ''}</TableBodyCell>
					<TableBodyCell>{item.annotationObject?.['@type'] ?? ''}</TableBodyCell>
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
		{$i18n('pages.auditableItemGraphAliasList.noItems')}
	</Label>
{/if}

<Modal
	open={showModal}
	title={$i18n(`pages.auditableItemGraphAliasList.title${selectedItem ? 'Update' : 'Add'}`)}
>
	<ValidatedForm
		title={''}
		actionButtonLabel={$i18n(
			`pages.auditableItemGraphAliasList.action${selectedItem ? 'Update' : 'Add'}`
		)}
		actionSuccessLabel={$i18n('pages.auditableItemGraphAliasList.actionSuccess')}
		validationMethod={validate}
		actionMethod={action}
		closeMethod={cancelModal}
		class="w-full max-w-none border-0"
		bind:validationErrors
	>
		{#snippet fields()}
			<Label>
				{$i18n('pages.auditableItemGraphAliasList.aliasId')}
				<Input
					type="text"
					name="aliasId"
					color={Is.arrayValue(validationErrors.aliasId) ? 'error' : 'default'}
					bind:value={aliasId}
				/>
				<ValidationError validationErrors={validationErrors.aliasId} />
			</Label>
			<Label>
				{$i18n('pages.auditableItemGraphAliasList.aliasFormat')}
				<Input type="text" name="aliasFormat" bind:value={aliasFormat} />
			</Label>
			<Label>
				{$i18n('pages.auditableItemGraphAliasList.annotationObject')}
				<Textarea
					bind:value={annotationObjectText}
					class="min-h-40 text-xs"
					color={Is.arrayValue(validationErrors.annotationObject) ? 'error' : 'default'}
				/>
				<ValidationError validationErrors={validationErrors.annotationObject} />
			</Label>
			<Label>
				{$i18n('pages.auditableItemGraphAliasList.selectExample')}
				<Select bind:value={selectedAnnotationObjectType}>
					{#each examples as example}
						<option value={example.annotationObject['@type']}
							>{example.annotationObject['@type']}</option
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
