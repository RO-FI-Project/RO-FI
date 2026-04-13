/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAudit from "../adminAudit.js";
import type * as contact from "../contact.js";
import type * as donations from "../donations.js";
import type * as fanIdeas from "../fanIdeas.js";
import type * as fanIdeasAdmin from "../fanIdeasAdmin.js";
import type * as leadsAdmin from "../leadsAdmin.js";
import type * as releases from "../releases.js";
import type * as releasesAdmin from "../releasesAdmin.js";
import type * as siteSettings from "../siteSettings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminAudit: typeof adminAudit;
  contact: typeof contact;
  donations: typeof donations;
  fanIdeas: typeof fanIdeas;
  fanIdeasAdmin: typeof fanIdeasAdmin;
  leadsAdmin: typeof leadsAdmin;
  releases: typeof releases;
  releasesAdmin: typeof releasesAdmin;
  siteSettings: typeof siteSettings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
