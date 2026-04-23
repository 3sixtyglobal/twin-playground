// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { fileURLToPath, URL } from "node:url";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: [
			{
				find: /^tailwindcss\/tailwind$/,
				replacement: "tailwindcss/index.css"
			},
			{
				find: "node:async_hooks",
				replacement: fileURLToPath(new URL("./src/polyfills/nodeAsyncHooks.ts", import.meta.url))
			}
		]
	},
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"]
	}
});
