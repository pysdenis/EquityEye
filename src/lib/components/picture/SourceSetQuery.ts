import type { querySizeMappings } from "./querySizeMappings.js";

export type SourceSetQuery = `${"<" | ">"}${keyof typeof querySizeMappings}`;
