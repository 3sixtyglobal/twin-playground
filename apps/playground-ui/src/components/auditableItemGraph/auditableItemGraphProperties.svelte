<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import type {
		IAuditableItemGraphAlias,
		IAuditableItemGraphEdge,
		IAuditableItemGraphResource
	} from '@twin.org/auditable-item-graph-models';
	import { Coerce, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Card,
		Error,
		Heading,
		i18n,
		Label,
		P,
		QR,
		Select,
		Span,
		Textarea,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import { onMount } from 'svelte';
	import AuditableItemGraphAliasList from './auditableItemGraphAliasList.svelte';
	import AuditableItemGraphEdgeList from './auditableItemGraphEdgeList.svelte';
	import AuditableItemGraphResourceList from './auditableItemGraphResourceList.svelte';
	import { createPrivateUrl } from '$stores/app';
	import {
		auditableItemGraphCreate,
		auditableItemGraphGet,
		auditableItemGraphUpdate
	} from '$stores/auditableItemGraphs';

	interface Props {
		itemId?: string | undefined;
		returnUrl: string;
	}

	let { itemId = $bindable(undefined), returnUrl }: Props = $props();

	const isUpdate = Is.stringValue(itemId);
	let busy = $state(false);
	let error: string | undefined = $state();
	let progress: string | undefined = $state();
	let saved: boolean = $state(false);
	let validationErrors: {
		[field in 'annotationObject']?: IValidationFailure[] | undefined;
	} = $state({});

	let aliasList: IAuditableItemGraphAlias[] = $state([]);
	let resourceList: IAuditableItemGraphResource[] = $state([]);
	let edgeList: IAuditableItemGraphEdge[] = $state([]);

	let selectedAnnotationObjectType = $state('');
	let annotationObjectText = $state('');

	const annotationObjectExamples: IJsonLdNodeObject[] = [
		{
			'@context': 'https://schema.org',
			'@type': 'Person',
			familyName: 'Sample Report',
			givenName: 'Dr. Jane Doe',
			email: 'email@sample.com',
			birthDate: '1970-01-01'
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Transaction',
			amount: 10000,
			currency: 'USD'
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Car',
			name: 'Sample Car',
			brand: 'Sample Brand',
			model: 'Sample Model',
			vehicleIdentificationNumber: '1414855109186',
			color: 'Red',
			manufactureDate: '2020-01-01'
		}
	];

	$effect(() => {
		const example = annotationObjectExamples.find(
			ex => ex['@type'] === selectedAnnotationObjectType
		);
		if (example) {
			annotationObjectText = JSON.stringify(example, null, 2);
		}
	});

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		if (Is.stringValue(annotationObjectText)) {
			Validation.json(
				'annotationObject',
				annotationObjectText,
				validationFailures,
				$i18n('pages.auditableItemGraphProperties.annotationObject')
			);
		}
	}

	async function loadData(loadId: string): Promise<void> {
		busy = true;
		error = '';

		const result = await auditableItemGraphGet(loadId);
		if (Is.stringValue(result?.error)) {
			error = result.error;
		} else if (Is.objectValue(result?.item)) {
			selectedAnnotationObjectType = '';
			annotationObjectText = JSON.stringify(result.item.annotationObject, null, 2);

			aliasList = result.item.aliases ?? [];
			resourceList = result.item.resources ?? [];
			edgeList = result.item.edges ?? [];
		}

		busy = false;
	}

	async function action(): Promise<string | undefined> {
		busy = true;
		progress = $i18n(
			`pages.auditableItemGraphProperties.progress${isUpdate ? 'Update' : 'Create'}`
		);

		let res;
		if (isUpdate && Is.stringValue(itemId)) {
			res = await auditableItemGraphUpdate(
				itemId,
				Coerce.object(annotationObjectText),
				aliasList,
				resourceList,
				edgeList
			);
		} else {
			res = await auditableItemGraphCreate(
				Coerce.object(annotationObjectText),
				aliasList,
				resourceList,
				edgeList
			);
			itemId = res?.id ?? '';
		}

		progress = undefined;
		busy = false;

		if (Is.stringValue(res?.error)) {
			return res?.error;
		}

		saved = true;
		busy = false;
		return undefined;
	}

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			await loadData(itemId);
		}
	});
</script>

<section class="flex w-full flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !saved}
		<ValidatedForm
			title={$i18n(`pages.auditableItemGraphProperties.title${isUpdate ? 'Update' : 'Create'}`)}
			actionButtonLabel={$i18n(`actions.${isUpdate ? 'update' : 'create'}`)}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			class="w-full max-w-none"
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				{#if isUpdate}
					<Label>
						{$i18n('pages.auditableItemGraphProperties.itemId')}
						<Span>{itemId}</Span>
					</Label>
				{/if}

				<Label
					>{$i18n('pages.auditableItemGraphProperties.annotationObject')}
					<Textarea
						bind:value={annotationObjectText}
						class="min-h-48 text-xs"
						color={Is.arrayValue(validationErrors.annotationObject) ? 'error' : 'default'}
					></Textarea>
					<ValidationError validationErrors={validationErrors.annotationObject} />
				</Label>

				<Label>
					{$i18n('pages.auditableItemGraphProperties.selectExample')}
					<Select bind:value={selectedAnnotationObjectType}>
						{#each annotationObjectExamples as example}
							<option value={example['@type']}>{example['@type']}</option>
						{/each}
					</Select>
				</Label>
				<hr class="my-5" />
				<AuditableItemGraphAliasList bind:items={aliasList} {busy}></AuditableItemGraphAliasList>
				<hr class="my-5" />
				<AuditableItemGraphResourceList bind:items={resourceList} {busy}
				></AuditableItemGraphResourceList>
				<hr class="my-5" />
				<AuditableItemGraphEdgeList bind:items={edgeList} {busy} itemId={itemId ?? ''}
				></AuditableItemGraphEdgeList>
			{/snippet}
			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
		<Error {error} />
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5"
				>{$i18n(
					`pages.auditableItemGraphProperties.resultTitle${isUpdate ? 'Update' : 'Create'}`
				)}</Heading
			>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.auditableItemGraphProperties.itemId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.auditableItemGraphProperties.itemQr')}
					<QR
						class="mt-2"
						qrData={createPrivateUrl(`auditable-item-graph/${itemId}`)}
						href={createPrivateUrl(`auditable-item-graph/${itemId}`)}
						label={$i18n('pages.auditableItemGraphProperties.itemQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
