<script lang="ts">
	import { goto } from '$app/navigation';
	import { Coerce, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		Error,
		i18n,
		Label,
		P,
		Select,
		Span,
		Textarea,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import type { MedicalTest, Service, TrackAction, WithContext } from 'schema-dts';
	import { onMount } from 'svelte';
	import {
		auditableItemStreamCreateEntry,
		auditableItemStreamGetEntry,
		auditableItemStreamUpdateEntry
	} from '$stores/auditableItemStreams';

	const trackAction: WithContext<TrackAction> = {
		'@context': 'https://schema.org',
		'@type': 'TrackAction',
		actionStatus: 'CompletedActionStatus',
		location: {
			'@type': 'Place',
			geo: {
				'@type': 'GeoCoordinates',
				latitude: 52.5201,
				longitude: 13.4051
			}
		},
		startTime: new Date().toISOString()
	};

	const medicalTest: WithContext<MedicalTest> = {
		'@context': 'https://schema.org',
		'@type': 'MedicalTest',
		identifier: new Date().toISOString(),
		description: 'Temperature reading: 72.5°F - Status: Normal',
		usedToDiagnose: {
			'@type': 'MedicalCondition',
			name: 'Temperature Check'
		}
	};

	const service: WithContext<Service> = {
		'@context': 'https://schema.org',
		'@type': 'Service',
		provider: {
			'@type': 'Person',
			name: 'John Smith'
		},
		description: 'Regular maintenance check completed',
		serviceType: 'Inspection',
		serviceOutput: 'Pass'
	};

	const examples = [trackAction, medicalTest, service];

	interface Props {
		streamId: string;
		entryId?: string | undefined;
	}

	let { streamId, entryId = undefined }: Props = $props();

	const isUpdate = Is.stringValue(entryId);
	let validationErrors: {
		[field in 'entryObject']?: IValidationFailure[] | undefined;
	} = $state({});
	let busy = $state(false);
	let progress: string | undefined = $state();
	const error = '';
	let result: string = $state('');
	let resultIsError: boolean = $state(false);
	let selectedEntryObjectType = $state('');
	let entryObjectText = $state('');

	$effect(() => {
		const template = examples.find(t => t['@type'] === selectedEntryObjectType);
		if (template) {
			const currentTime = new Date().toISOString();

			const newEntry = { ...template };

			switch (template['@type']) {
				case 'TrackAction':
					(newEntry as WithContext<TrackAction>).startTime = currentTime;
					break;
				case 'MedicalTest':
					(newEntry as WithContext<MedicalTest>).identifier = currentTime;
					break;
				case 'Service':
					(newEntry as WithContext<Service>).description =
						`${template.description} - ${currentTime}`;
					break;
			}

			entryObjectText = JSON.stringify(newEntry, null, 2);
		}
	});

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.json(
			'entryObject',
			entryObjectText,
			validationFailures,
			$i18n('pages.auditableItemStreamEntryProperties.entryObject')
		);
	}

	async function loadData(id: string, loadEntryId: string): Promise<void> {
		busy = true;
		result = '';
		resultIsError = false;

		const res = await auditableItemStreamGetEntry(id, loadEntryId);
		if (Is.stringValue(res?.error)) {
			result = res.error;
			resultIsError = true;
		} else if (Is.objectValue(res?.item)) {
			entryObjectText = JSON.stringify(res.item.entryObject, null, 2);
		}

		busy = false;
	}

	async function action(): Promise<string | undefined> {
		progress = $i18n(
			`pages.auditableItemStreamEntryProperties.progress${isUpdate ? 'Update' : 'Create'}`
		);

		let res;
		if (isUpdate && Is.stringValue(entryId)) {
			res = await auditableItemStreamUpdateEntry(
				streamId,
				entryId,
				Coerce.object(entryObjectText) ?? {}
			);
		} else {
			res = await auditableItemStreamCreateEntry(streamId, Coerce.object(entryObjectText) ?? {});
		}

		progress = undefined;
		busy = false;

		if (Is.stringValue(res?.error)) {
			return res?.error;
		}

		await goto(`/secure/auditable-item-stream/${streamId}/entries`);

		return undefined;
	}

	async function close(): Promise<void> {
		await goto(`/secure/auditable-item-stream/${streamId}/entries`);
	}

	onMount(async () => {
		if (Is.stringValue(entryId)) {
			await loadData(streamId, entryId);
		}
	});
</script>

<ValidatedForm
	title={$i18n(`pages.auditableItemStreamEntryProperties.title${isUpdate ? 'Update' : 'Create'}`)}
	actionButtonLabel={$i18n(
		`pages.auditableItemStreamEntryProperties.action${isUpdate ? 'Update' : 'Create'}`
	)}
	actionSuccessLabel={$i18n(
		`pages.auditableItemStreamEntryProperties.actionSuccess${isUpdate ? 'Update' : 'Create'}`
	)}
	validationMethod={validate}
	actionMethod={action}
	closeMethod={close}
	bind:validationErrors
	bind:busy
	bind:result
	bind:resultIsError
>
	{#snippet fields()}
		{#if !Is.stringValue(result)}
			{#if Is.stringValue(entryId)}
				<Label>
					{$i18n('pages.auditableItemStreamEntryProperties.entryId')}
					<Span>{entryId}</Span>
				</Label>
			{/if}

			<Label>
				{$i18n('pages.auditableItemStreamEntryProperties.template')}
				<Select bind:value={selectedEntryObjectType} disabled={busy}>
					{#each examples as template}
						<option value={template['@type']}>{template['@type']}</option>
					{/each}
				</Select>
			</Label>

			<Label>
				{$i18n('pages.auditableItemStreamEntryProperties.entryObject')}
				<Textarea
					bind:value={entryObjectText}
					class="min-h-48 text-xs"
					color={Is.arrayValue(validationErrors.entryObject) ? 'error' : 'default'}
					disabled={busy}
				/>
				<ValidationError validationErrors={validationErrors.entryObject} />
			</Label>
		{/if}
	{/snippet}
	{#snippet afterAction()}
		{#if Is.stringValue(progress)}
			<P>{progress}</P>
		{/if}
	{/snippet}
</ValidatedForm>
<Error {error} />
