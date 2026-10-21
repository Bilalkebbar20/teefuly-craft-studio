/** Global context variable typings shared across routes. */

import type { Config } from "../env";
import type { Logger } from "./logger";
import type { CatalogService } from "../services/catalogService";

declare module "hono" {
  interface ContextVariableMap {
    config: Config;
    logger: Logger;
    catalog: CatalogService;
  }
}

export type { Config, Logger };