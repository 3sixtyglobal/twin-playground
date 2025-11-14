<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Coerce, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		Button,
		Card,
		Heading,
		i18n,
		Input,
		Label,
		P,
		QR,
		Select,
		Span,
		Textarea,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import type { NoteDigitalDocument, WithContext } from 'schema-dts';
	import { onMount } from 'svelte';
	import { createPrivateUrl } from '$stores/app';
	import {
		auditableItemStreamCreate,
		auditableItemStreamGet,
		auditableItemStreamUpdate
	} from '$stores/auditableItemStreams';

	const note: WithContext<NoteDigitalDocument> = {
		'@context': 'https://schema.org',
		'@type': 'NoteDigitalDocument',
		text: 'This is an example note for the stream.'
	};

	const annotationObjectExamples = [note];

	interface Props {
		itemId?: string | undefined;
	}

	let { itemId = $bindable(undefined) }: Props = $props();

	let selectedAnnotationObjectType = $state('');
	let annotationObjectText = $state('');
	let immutableInterval: number | undefined = $state(undefined);

	const isUpdate = Is.stringValue(itemId);
	let validationErrors: {
		[field in 'annotationObject' | 'immutableInterval']?: IValidationFailure[] | undefined;
	} = $state({});
	let busy = $state(false);
	let progress: string | undefined = $state();
	let result: string = $state('');
	let resultIsError: boolean = $state(false);
	let saved: boolean = $state(false);

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		if (!isUpdate && Is.notEmpty(immutableInterval)) {
			Validation.integer(
				'immutableInterval',
				immutableInterval,
				validationFailures,
				$i18n('pages.auditableItemStreamProperties.immutableInterval')
			);
		}

		if (Is.stringValue(annotationObjectText)) {
			Validation.json(
				'annotationObject',
				annotationObjectText,
				validationFailures,
				$i18n('pages.auditableItemStreamProperties.annotationObject')
			);
		}
	}

	async function close(): Promise<void> {
		await goto('/secure/auditable-item-stream');
	}

	$effect(() => {
		const example = annotationObjectExamples.find(t => t['@type'] === selectedAnnotationObjectType);
		if (example) {
			annotationObjectText = JSON.stringify(example, null, 2);
		}
	});

	async function loadData(loadId: string): Promise<void> {
		busy = true;
		result = '';
		resultIsError = false;

		const res = await auditableItemStreamGet(loadId);
		if (Is.stringValue(res?.error)) {
			result = res.error;
			resultIsError = true;
		} else if (Is.objectValue(res?.item)) {
			annotationObjectText = JSON.stringify(res.item.annotationObject, null, 2);
			immutableInterval = res.item.immutableInterval;
		}

		busy = false;
	}

	async function action(): Promise<string | undefined> {
		progress = $i18n(
			`pages.auditableItemStreamProperties.progress${isUpdate ? 'Update' : 'Create'}`
		);

		let res;
		if (isUpdate && Is.stringValue(itemId)) {
			res = await auditableItemStreamUpdate(itemId, Coerce.object(annotationObjectText));
		} else {
			res = await auditableItemStreamCreate(Coerce.object(annotationObjectText), immutableInterval);
			itemId = res?.id ?? '';
		}

		progress = undefined;
		busy = false;

		if (Is.stringValue(res?.error)) {
			return res?.error;
		}

		saved = true;

		return undefined;
	}

	onMount(async () => {
		if (Is.stringValue(itemId)) {
			await loadData(itemId);
		}
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !saved}
		<ValidatedForm
			title={$i18n(`pages.auditableItemStreamProperties.title${isUpdate ? 'Update' : 'Create'}`)}
			actionButtonLabel={$i18n(
				`pages.auditableItemStreamProperties.action${isUpdate ? 'Update' : 'Create'}`
			)}
			actionSuccessLabel={$i18n(
				`pages.auditableItemStreamProperties.actionSuccess${isUpdate ? 'Update' : 'Create'}`
			)}
			validationMethod={validate}
			actionMethod={result ? undefined : action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
			bind:result
			bind:resultIsError
		>
			{#snippet fields()}
				{#if !Is.stringValue(result)}
					<Label>
						{$i18n('pages.auditableItemStreamProperties.template')}
						<Select bind:value={selectedAnnotationObjectType} disabled={busy}>
							{#each annotationObjectExamples as template}
								<option value={template['@type']}>{template['@type']}</option>
							{/each}
						</Select>
					</Label>

					{#if !isUpdate}
						<Label>
							{$i18n('pages.auditableItemStreamProperties.immutableInterval')}
							<Input
								type="number"
								name="immutableInterval"
								color={Is.arrayValue(validationErrors.immutableInterval) ? 'error' : 'default'}
								bind:value={immutableInterval}
								disabled={busy}
							/>
							<ValidationError validationErrors={validationErrors.immutableInterval} />
						</Label>
					{/if}

					<Label>
						{$i18n('pages.auditableItemStreamProperties.annotationObject')}
						<Textarea
							bind:value={annotationObjectText}
							class="min-h-48 text-xs"
							color={Is.arrayValue(validationErrors.annotationObject) ? 'error' : 'default'}
							disabled={busy}
						/>
						<ValidationError validationErrors={validationErrors.annotationObject} />
					</Label>
				{/if}
			{/snippet}
			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5"
				>{$i18n(
					`pages.auditableItemStreamProperties.resultTitle${isUpdate ? 'Update' : 'Create'}`
				)}</Heading
			>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.auditableItemStreamProperties.itemId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.auditableItemStreamProperties.itemQr')}
					<QR
						class="mt-2"
						qrData={createPrivateUrl(`auditable-item-stream/${itemId}`)}
						href={createPrivateUrl(`auditable-item-stream/${itemId}`)}
						label={$i18n('pages.auditableItemStreamProperties.itemQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
