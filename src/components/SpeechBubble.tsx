import React from 'react';
import {
  SyncedSpeechBubble,
  type SyncedSpeechBubbleProps,
} from './SyncedSpeechBubble';

export type SpeechBubbleProps = SyncedSpeechBubbleProps;

/**
 * SpeechBubble delegates directly to SyncedSpeechBubble for backwards compatibility
 * across existing imports while keeping all voice-synced progressive reveal logic unified.
 */
export const SpeechBubble: React.FC<SpeechBubbleProps> = (props) => (
  <SyncedSpeechBubble {...props} />
);
