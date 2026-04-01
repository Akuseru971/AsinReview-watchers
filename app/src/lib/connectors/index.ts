// src/lib/connectors/index.ts
// Connector registry – swap the active connector without touching any other file

import type { ReviewConnector } from "@/types";
import { mockConnector } from "./mock-connector";

/**
 * Active connector.
 * Replace mockConnector with amazonConnector (or any other) when ready.
 */
export const activeConnector: ReviewConnector = mockConnector;
