// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { sveltekit } from "@sveltejs/kit/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		sveltekit(),
		nodePolyfills({
			include: ["crypto", "stream", "vm"]
		})
	],
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"]
	}
});
