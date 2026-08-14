import type { ComponentType } from 'react';
import { responseTimeLegs } from './ResponseTimeLegs';
import { paymentRequestFlow } from './PaymentRequestFlow';
import { historicalDataStore } from './HistoricalDataStore';
import { eligibilityTimeout } from './EligibilityTimeout';
import { dreamHouseDataModel } from './DreamHouseDataModel';

export type QuestionDiagram = {
  /** The figure itself — a hand-authored inline SVG component. */
  Svg: ComponentType;
  /** Full prose description, for readers who cannot see the figure. */
  alt: string;
  /** One line under the figure stating what it shows. */
  caption: string;
  /**
   * Set when no original figure survived and this one was drawn from the
   * question's own description. Surfaced in the UI — a reader deserves to know
   * they are looking at a redrawing rather than the exam's own artwork.
   */
  reconstructed?: boolean;
  /**
   * Width in CSS pixels below which the figure scrolls sideways rather than
   * shrinking further. Set per diagram from where its smallest labels stop
   * being readable.
   */
  minWidth: number;
};

/**
 * Question id → figure. Keyed on `id` rather than on a field in the deck JSON
 * because ids are permanent (see scripts/add-question-ids.mjs) and because an
 * SVG inlined into a deck file would make the content unreadable to edit.
 *
 * Only add an entry where the prose genuinely cannot carry the mechanism. Four
 * questions in the Integration Architect deck qualify: two whose figures were
 * flattened into a bracketed textual rendering, and two that referred to a
 * diagram which never made it into the deck.
 */
export const QUESTION_DIAGRAMS: Record<string, QuestionDiagram> = {
  // "Which computation represents the end-to-end response time?"
  '0ae13744': { ...responseTimeLegs, minWidth: 1000 },
  // "Improve their SLA and update conflict handling" — payment requests.
  d258eebd: { ...paymentRequestFlow, minWidth: 1000 },
  // "Given the diagram below" — Salesforce, middleware, historical data store.
  '9a718961': { ...historicalDataStore, minWidth: 720 },
  // "See diagram & description" — eligibility checks behind a 9-second gateway.
  '647f738a': { ...eligibilityTimeout, minWidth: 950 },
  // Data Architect: "a data model as shown in the image" — the DreamHouse ERD.
  bd39a845: { ...dreamHouseDataModel, minWidth: 900 },
};

export function diagramFor(id: string | undefined): QuestionDiagram | undefined {
  return id ? QUESTION_DIAGRAMS[id] : undefined;
}
