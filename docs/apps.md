# Playground Applications

## playground-node

The app serves as the backend REST API server for the playground environment. Its primary purpose is to expose and demonstrate a comprehensive set of API endpoints built on the ecosystem framework packages, encompassing authentication, identity management, attestation, blob storage, non-fungible tokens, auditable item graphs and streams, and verifiable credentials. By doing so, it provides a working, end-to-end example of how the framework packages can be composed into a production-grade API layer. The full API surface is described in the [OpenAPI specification](https://editor-next.swagger.io/?url=https://raw.githubusercontent.com/iotaledger/playground/refs/heads/next/apps/playground-node/docs/open-api/spec.json).

- [README](../apps/playground-node/README.md)
- [Configuration](../apps/playground-node/docs/configuration.md)
- [Deployment](../apps/playground-node/docs/deployment.md)
- [Changelog](../apps/playground-node/docs/changelog.md)

## playground-ui

This app is designed to provide an interactive, browser-based interface for exploring the playground REST APIs. It plays a crucial role in demonstrating how the API endpoints can be consumed from a client application, offering a hands-on exploration environment for features such as identity, attestation, and storage. Its implementation uses [Svelte](https://svelte.dev/) and presents a responsive, developer-friendly front-end that aligns with the repository's goal of demonstrating real-world usage patterns.

- [README](../apps/playground-ui/README.md)
- [Changelog](../apps/playground-ui/docs/changelog.md)
