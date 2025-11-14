<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Converter, Is, Validation, type IValidationFailure } from '@twin.org/core';
	import {
		Button,
		Card,
		Heading,
		i18n,
		Input,
		Label,
		P,
		QR,
		Span,
		ValidatedForm,
		ValidationError,
		Textarea
	} from '@twin.org/ui-components-svelte';
	import { createPrivateUrl } from '$stores/app';
	import { verifiableStorageUpload } from '$stores/verifiableStorage';
	import { verifiableStoragesEntrySet } from '$stores/verifiableStorages';

	interface Props {
		returnUrl: string;
	}

	let { returnUrl }: Props = $props();
	let description = $state('');
	let textContent = $state('');
	let validationErrors: {
		[field in 'description' | 'textContent']?: IValidationFailure[] | undefined;
	} = $state({});
	let busy = $state(false);
	let itemId: string | undefined = $state();
	let progress: string | undefined = $state();

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'description',
			Is.stringValue(description) ? description : undefined,
			validationFailures,
			$i18n('pages.verifiableStorageProperties.description')
		);
		Validation.notEmpty(
			'textContent',
			Is.stringValue(textContent) ? textContent : undefined,
			validationFailures,
			$i18n('pages.verifiableStorageProperties.textContent')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		itemId = undefined;

		progress = $i18n('pages.verifiableStorageProperties.progress');

		const data = Converter.utf8ToBytes(textContent);
		const result = await verifiableStorageUpload(data);

		progress = undefined;
		busy = false;

		if (Is.stringValue(result?.error)) {
			return result?.error;
		}

		itemId = result?.id;

		if (Is.stringValue(itemId)) {
			await verifiableStoragesEntrySet({
				id: itemId,
				description,
				data: Converter.bytesToBase64(data),
				dateCreated: new Date().toISOString()
			});
		}

		return undefined;
	}
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !Is.stringValue(itemId)}
		<ValidatedForm
			title={$i18n('pages.verifiableStorageProperties.title')}
			actionButtonLabel={$i18n('pages.verifiableStorageProperties.action')}
			actionSuccessLabel={$i18n('pages.verifiableStorageProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.verifiableStorageProperties.description')}
					<Input
						type="text"
						name="description"
						color={Is.arrayValue(validationErrors.description) ? 'error' : 'default'}
						bind:value={description}
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.description} />
				</Label>
				<Label>
					{$i18n('pages.verifiableStorageProperties.textContent')}
					<Textarea
						name="textContent"
						color={Is.arrayValue(validationErrors.textContent) ? 'error' : 'default'}
						bind:value={textContent}
						disabled={busy}
					/>
					<ValidationError validationErrors={validationErrors.textContent} />
				</Label>
			{/snippet}
			{#snippet afterAction()}
				{#if Is.stringValue(progress)}
					<P>{progress}</P>
				{/if}
			{/snippet}
		</ValidatedForm>
	{:else}
		<Card class="flex flex-col gap-5">
			<Heading tag="h5">{$i18n('pages.verifiableStorageProperties.resultTitle')}</Heading>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.verifiableStorageProperties.itemId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.verifiableStorageProperties.itemQr')}
					<QR
						class="mt-2"
						qrData={createPrivateUrl(`verifiable-storage/${itemId}`)}
						href={createPrivateUrl(`verifiable-storage/${itemId}`)}
						label={$i18n('pages.verifiableStorageProperties.itemQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
