<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import type {
		IAuditableItemGraphEdge,
		IAuditableItemGraphVertex
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
	import { onMount } from 'svelte';
	import { auditableItemGraphListForEdges } from '$stores/auditableItemGraphs';

	export let itemId: string;
	export let items: Omit<IAuditableItemGraphEdge, '@context' | 'type'>[];
	export let busy: boolean;
	let showModal = false;
	let progress: string | undefined;
	let selectedItem: Omit<IAuditableItemGraphEdge, '@context' | 'type'> | undefined;
	let edgeId: string | undefined;
	let edgeTargetId: string | undefined;
	let edgeRelationships: string | undefined;
	let validationErrors: {
		[field in 'edgeId' | 'edgeRelationships' | 'annotationObject']?:
			| IValidationFailure[]
			| undefined;
	} = {};

	let selectedAnnotationObjectType = '';
	let annotationObjectText = '';
	let availableVertices: IAuditableItemGraphVertex[] = [];

	const examples: {
		edgeRelationships: string;
		annotationObject: IJsonLdNodeObject;
	}[] = [
		{
			edgeRelationships: 'relatedTo,connectedTo',
			annotationObject: {
				'@context': 'https://schema.org',
				'@type': 'Event',
				name: 'Edge Example 1'
			}
		},
		{
			edgeRelationships: 'dependsOn',
			annotationObject: {
				'@context': 'https://schema.org',
				'@type': 'Service',
				name: 'Edge Example 2'
			}
		}
	];

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.stringValue(
			'edgeTargetId',
			edgeTargetId,
			validationFailures,
			$i18n('pages.auditableItemGraphEdgeList.edgeTargetId')
		);

		Validation.stringValue(
			'edgeRelationships',
			edgeRelationships,
			validationFailures,
			$i18n('pages.auditableItemGraphEdgeList.edgeRelationships')
		);

		if (Is.stringValue(annotationObjectText)) {
			Validation.json(
				'annotationObject',
				annotationObjectText,
				validationFailures,
				$i18n('pages.auditableItemGraphEdgeList.annotationObject')
			);
		}
	}

	function removeItem(index: number): void {
		items.splice(index, 1);
		items = items.slice();
	}

	$: {
		const example = examples.find(
			ex => ex.annotationObject['@type'] === selectedAnnotationObjectType
		);
		if (example) {
			annotationObjectText = JSON.stringify(example.annotationObject, null, 2);
			edgeRelationships = example.edgeRelationships;
		}
	}

	async function openModal(index: number = -1): Promise<void> {
		showModal = true;
		selectedAnnotationObjectType = '';
		if (index >= 0) {
			selectedItem = items[index];
			edgeId = selectedItem.id;
			edgeTargetId = selectedItem.targetId;
			edgeRelationships = selectedItem.edgeRelationships.join(',');
			annotationObjectText = JSON.stringify(selectedItem.annotationObject, null, 2);
		} else {
			selectedItem = undefined;
			edgeId = undefined;
			edgeTargetId = undefined;
			edgeRelationships = undefined;
			annotationObjectText = '';
		}
	}

	async function action(): Promise<string | undefined> {
		showModal = false;
		if (Is.object(selectedItem)) {
			selectedItem.id = edgeId ?? selectedItem.id;
			selectedItem.targetId = edgeTargetId ?? selectedItem.targetId;
			selectedItem.edgeRelationships = edgeRelationships?.split(',') ?? [];
			selectedItem.annotationObject = Coerce.object(annotationObjectText);
		} else if (Is.stringValue(edgeTargetId)) {
			items.push({
				id: edgeId,
				targetId: edgeTargetId,
				edgeRelationships: edgeRelationships?.split(',') ?? [],
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

	function getVertexDisplayText(vertex: IAuditableItemGraphVertex): string {
		if (!Is.object(vertex)) {
			return '';
		}

		if (Is.arrayValue(vertex.aliases) && Is.object(vertex.aliases[0])) {
			return vertex.aliases[0].id;
		}

		return vertex.id;
	}

	async function loadAvailableVertices(): Promise<void> {
		const result = await auditableItemGraphListForEdges();
		if (Is.arrayValue(result?.items)) {
			availableVertices = result.items.filter(v => v.id !== itemId);
		}
	}

	onMount(async () => {
		await loadAvailableVertices();
	});
</script>

<div class="flex flex-row justify-between gap-5">
	<Heading tag="h5">{$i18n('pages.auditableItemGraphEdgeList.title')}</Heading>
	<Button on:click={async () => openModal()} size="sm" class="whitespace-nowrap" disabled={busy}>
		<Icons.PlusOutline class="mr-2" />
		{$i18n('pages.auditableItemGraphEdgeList.addItem')}
	</Button>
</div>
{#if Is.arrayValue(items)}
	<Table>
		<TableHead>
			<TableHeadCell>{$i18n('pages.auditableItemGraphEdgeList.edgeId')}</TableHeadCell>
			<TableHeadCell>{$i18n('pages.auditableItemGraphEdgeList.edgeRelationships')}</TableHeadCell>
			<TableHeadCell>{$i18n('pages.auditableItemGraphEdgeList.annotationObject')}</TableHeadCell>
			<TableHeadCell>{$i18n('common.labels.actions')}</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each items as item, index}
				<TableBodyRow>
					<TableBodyCell wrap>
						{item.id}
					</TableBodyCell>
					<TableBodyCell>{item.edgeRelationships ?? ''}</TableBodyCell>
					<TableBodyCell>{item.annotationObject?.['@type'] ?? ''}</TableBodyCell>
					<TableBodyCell
						><div class="flex gap-2">
							<Button
								size="xs"
								color="plain"
								on:click={async () => openModal(index)}
								disabled={busy}><Icons.EditOutline /></Button
							>
							<Button
								size="xs"
								color="plain"
								on:click={async () => removeItem(index)}
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
		{$i18n('pages.auditableItemGraphEdgeList.noItems')}
	</Label>
{/if}

<Modal
	open={showModal}
	title={$i18n(`pages.auditableItemGraphEdgeList.title${selectedItem ? 'Update' : 'Add'}`)}
>
	<ValidatedForm
		title={''}
		actionButtonLabel={$i18n(
			`pages.auditableItemGraphEdgeList.action${selectedItem ? 'Update' : 'Add'}`
		)}
		actionSuccessLabel={$i18n('pages.auditableItemGraphEdgeList.actionSuccess')}
		validationMethod={validate}
		actionMethod={action}
		closeMethod={cancelModal}
		class="w-full max-w-none border-0"
		bind:validationErrors
	>
		{#snippet fields()}
			<Label>
				{$i18n('pages.auditableItemGraphEdgeList.edgeId')}
				<Select
					name="edgeId"
					color={Is.arrayValue(validationErrors.edgeId) ? 'error' : 'default'}
					bind:value={edgeTargetId}
					disabled={busy}
				>
					{#each availableVertices as itemOption}
						{#if Is.object(itemOption)}
							<option value={itemOption.id}>
								{getVertexDisplayText(itemOption)}
							</option>
						{/if}
					{/each}
				</Select>
				<ValidationError validationErrors={validationErrors.edgeId} />
			</Label>
			<Label>
				{$i18n('pages.auditableItemGraphEdgeList.edgeRelationships')}
				<br />
				{$i18n('pages.auditableItemGraphEdgeList.edgeRelationshipsHelp')}
				<Input
					type="text"
					name="edgeRelationships"
					bind:value={edgeRelationships}
					color={Is.arrayValue(validationErrors.edgeRelationships) ? 'error' : 'default'}
				/>
				<ValidationError validationErrors={validationErrors.edgeRelationships} />
			</Label>
			<Label>
				{$i18n('pages.auditableItemGraphEdgeList.annotationObject')}
				<Textarea
					bind:value={annotationObjectText}
					class="min-h-40 text-xs"
					color={Is.arrayValue(validationErrors.annotationObject) ? 'error' : 'default'}
				/>
				<ValidationError validationErrors={validationErrors.annotationObject} />
			</Label>
			<Label>
				{$i18n('pages.auditableItemGraphEdgeList.selectExample')}
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
