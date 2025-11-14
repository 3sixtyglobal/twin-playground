<script lang="ts">
	// Copyright 2024 IOTA Stiftung.
	// SPDX-License-Identifier: Apache-2.0.
	import { page } from '$app/state';
	import { Is, ObjectHelper } from '@twin.org/core';
	import { Icons, AppLayout, type ISideBarGroup, i18n } from '@twin.org/ui-components-svelte';
	import { authenticationState } from '$stores/authentication';
	import { privateProfile } from '$stores/identityProfile';
	import '../app.css';
	import { serverHealthStatus, serverName, serverVersion } from '$stores/information';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let sidebarGroups: ISideBarGroup[] = $state([]);
	let showAuthBadge = $state(false);
	let finalInitials: string = $state('');
	const isSecureUrl = !page.route.id?.startsWith('/public/');
	const appName = $i18n('app.name');

	const loggedInNavigation = [
		{
			label: $i18n('navigation.dashboard'),
			icon: Icons.SwatchbookOutline,
			route: '/secure/dashboard'
		},
		{
			label: $i18n('navigation.blobs'),
			icon: Icons.FileOutline,
			route: '/secure/blob'
		},
		{
			label: $i18n('navigation.documents'),
			icon: Icons.FileDocOutline,
			route: '/secure/document'
		},
		{
			label: $i18n('navigation.attestations'),
			icon: Icons.ShieldCheckOutline,
			route: '/secure/attestation'
		},
		{
			label: $i18n('navigation.nft'),
			icon: Icons.FileImageOutline,
			route: '/secure/nft'
		},
		{
			label: $i18n('navigation.immutable-proof'),
			icon: Icons.ShieldCheckOutline,
			route: '/secure/immutable-proof'
		},
		{
			label: $i18n('navigation.verifiable-storage'),
			icon: Icons.FileShieldOutline,
			route: '/secure/verifiable-storage'
		},
		{
			label: $i18n('navigation.auditable-item-graphs'),
			icon: Icons.TrackingOutline,
			route: '/secure/auditable-item-graph'
		},
		{
			label: $i18n('navigation.auditable-item-streams'),
			icon: Icons.RectangleListOutline,
			route: '/secure/auditable-item-stream'
		},
		{
			label: $i18n('navigation.logging'),
			icon: Icons.BookOpenOutline,
			route: '/secure/logging'
		},
		{
			label: $i18n('navigation.telemetry'),
			icon: Icons.ChartPieOutline,
			route: '/secure/telemetry'
		},
		{
			label: $i18n('navigation.data-processing'),
			icon: Icons.UploadOutline,
			route: '/secure/data-processing'
		},
		{
			label: $i18n('navigation.rights-management-pap'),
			icon: Icons.LockSolid,
			route: '/secure/rights-management-pap'
		},
		{
			label: $i18n('navigation.logout'),
			icon: Icons.LockOpenOutline,
			route: '/authentication/logout'
		}
	];

	const loggedOutNavigation = [
		{
			label: $i18n('navigation.login'),
			icon: Icons.LockOutline,
			route: '/'
		}
	];

	$effect(() => {
		sidebarGroups = [];
		if ($authenticationState === 'authenticated') {
			showAuthBadge = true;
			sidebarGroups = [
				{
					items: loggedInNavigation
				}
			];
		} else if ($authenticationState === 'not-authenticated') {
			showAuthBadge = false;
			sidebarGroups = [
				{
					items: loggedOutNavigation
				}
			];
		}
	});

	$effect(() => {
		const initials: string[] = [];

		if (isSecureUrl) {
			const givenName = ObjectHelper.propertyGet($privateProfile, 'givenName');
			if (Is.stringValue(givenName)) {
				initials.push(givenName[0].toUpperCase());
			}

			const familyName = ObjectHelper.propertyGet($privateProfile, 'familyName');
			if (Is.stringValue(familyName)) {
				initials.push(familyName[0].toUpperCase());
			}

			if (initials.length === 0) {
				const email = ObjectHelper.propertyGet($privateProfile, 'email');
				if (Is.stringValue(email)) {
					initials.push(email[0]);
				}
			}

			finalInitials = initials.join('');
		}
	});

	$effect(() => {
		document.title = appName;
	});
</script>

<AppLayout
	showSideBar={isSecureUrl}
	showFooter={isSecureUrl}
	homeNavRoute={isSecureUrl ? '/' : undefined}
	title={appName}
	{sidebarGroups}
	authenticated={isSecureUrl && showAuthBadge}
	initials={finalInitials}
	profileNavRoute="/secure/identity-profile"
	serverHealthStatus={$serverHealthStatus === 'ok' ? 'success' : $serverHealthStatus}
	serverName={$serverName}
	serverVersion={$serverVersion}
>
	{@render children?.()}
</AppLayout>
