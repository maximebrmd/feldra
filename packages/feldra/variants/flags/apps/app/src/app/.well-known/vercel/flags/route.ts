// biome-ignore lint/performance/noNamespaceImport: Flags discovery needs every definition.
import * as flags from "@repo/feature-flags";
import { createFlagsDiscoveryEndpoint, getProviderData } from "flags/next";

export const GET = createFlagsDiscoveryEndpoint(async () =>
  getProviderData(flags)
);
