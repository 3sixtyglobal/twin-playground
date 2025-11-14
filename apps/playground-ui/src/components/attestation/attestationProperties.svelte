<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { goto } from '$app/navigation';
	import { Converter, Is, ObjectHelper, Validation, type IValidationFailure } from '@twin.org/core';
	import { Sha256 } from '@twin.org/crypto';
	import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
	import {
		Button,
		Card,
		Heading,
		i18n,
		Label,
		P,
		QR,
		Select,
		Span,
		ValidatedForm,
		ValidationError
	} from '@twin.org/ui-components-svelte';
	import type { DigitalDocument, WithContext } from 'schema-dts';
	import { onMount } from 'svelte';
	import { createPublicUrl } from '$stores/app';
	import { attestationCreate } from '$stores/attestation';
	import { attestationsEntrySet } from '$stores/attestations';
	import { blobStorageGet, blobStorageList } from '$stores/blobStorage';
	import { profileIdentity } from '$stores/identityProfile';

	interface Props {
		returnUrl: string;
	}

	let { returnUrl }: Props = $props();
	let validationErrors: {
		[field in 'blobId']?: IValidationFailure[] | undefined;
	} = $state({});
	let busy = $state(false);
	let signature: string | undefined = $state();
	let progress: string | undefined = $state();
	let itemId: string | undefined = $state();
	let blobNames: { value: string; name: string }[] = $state([]);
	let blobId: string | undefined = $state();

	async function validate(validationFailures: IValidationFailure[]): Promise<void> {
		Validation.notEmpty(
			'blobId',
			Is.stringValue(blobId) ? blobId : undefined,
			validationFailures,
			$i18n('pages.attestationProperties.blob')
		);
	}

	async function close(): Promise<void> {
		await goto(returnUrl);
	}

	async function action(): Promise<string | undefined> {
		signature = undefined;
		itemId = undefined;

		if (Is.stringValue(blobId)) {
			progress = $i18n('pages.attestationProperties.progress');

			const resultBlob = await blobStorageGet(blobId, true);
			if (Is.stringValue(resultBlob?.error)) {
				return resultBlob?.error;
			}

			const bytes = Converter.base64ToBytes(resultBlob?.data?.blob ?? '');
			signature = Converter.bytesToBase64(Sha256.sum256(bytes));

			const blobDescription = resultBlob?.data?.metadata?.name ?? 'file';

			const data: WithContext<DigitalDocument & IJsonLdNodeObject> = {
				'@context': 'https://schema.org',
				'@type': 'DigitalDocument',
				id: blobId,
				identifier: signature
			};

			const result = await attestationCreate(data);
			progress = '';

			if (Is.stringValue(result?.error)) {
				return result?.error;
			}

			itemId = result?.attestationId;

			if (Is.stringValue(itemId)) {
				const ownerIdentity = $profileIdentity;
				await attestationsEntrySet({
					id: itemId,
					description: $i18n('pages.attestationProperties.attestationOf', {
						blob: blobDescription
					}),
					dateCreated: new Date().toISOString(),
					ownerIdentity
				});
			}
		}

		return undefined;
	}

	onMount(async () => {
		busy = true;

		const blobsFirstPage = await blobStorageList();
		blobNames =
			blobsFirstPage?.items?.map(blob => ({
				value: blob.id,
				name: ObjectHelper.propertyGet(blob, 'metadata.name') ?? blob.id
			})) ?? [];
		if (blobNames.length > 0) {
			blobId = blobNames[0].value;
		}
		busy = false;
	});
</script>

<section class="flex flex-col items-start justify-center gap-5 lg:flex-row">
	{#if !Is.stringValue(itemId)}
		<ValidatedForm
			title={$i18n('pages.attestationProperties.title')}
			actionButtonLabel={$i18n('pages.attestationProperties.action')}
			actionSuccessLabel={$i18n('pages.attestationProperties.actionSuccess')}
			validationMethod={validate}
			actionMethod={action}
			closeMethod={close}
			bind:validationErrors
			bind:busy
		>
			{#snippet fields()}
				<Label>
					{$i18n('pages.attestationProperties.blob')}
					<Select
						name="blob"
						placeholder={$i18n('pages.attestationProperties.selectBlob')}
						items={blobNames}
						color={Is.arrayValue(validationErrors.blobId) ? 'error' : 'default'}
						bind:value={blobId}
						disabled={busy}
					></Select>
					<ValidationError validationErrors={validationErrors.blobId} />
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
			<Heading tag="h5">{$i18n('pages.attestationProperties.resultTitle')}</Heading>
			{#if Is.stringValue(itemId)}
				<Label>
					{$i18n('pages.attestationProperties.attestationId')}
					<Span>{itemId}</Span>
				</Label>
				<Label>
					{$i18n('pages.attestationProperties.attestationQr')}
					<QR
						class="mt-2"
						qrData={createPublicUrl(`attestation/${itemId}`)}
						href={createPublicUrl(`attestation/${itemId}`)}
						label={$i18n('pages.attestationProperties.attestationQr')}
						dimensions={128}
					/>
				</Label>
			{/if}
			{#if Is.stringValue(signature)}
				<Label>
					{$i18n('pages.attestationProperties.signature')}
					<Span>{signature}</Span>
				</Label>
			{/if}
			<Button onclick={async () => close()}>{$i18n('actions.close')}</Button>
		</Card>
	{/if}
</section>
