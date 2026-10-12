import type { AttendeeId } from './types';

export interface ValidationCatalog {
  readonly eventFiles?: readonly {
    readonly id: string;
    readonly stem: string;
  }[];
  readonly attendees?: readonly {
    readonly id: AttendeeId;
    readonly role: string;
  }[];
  readonly titles?: readonly { readonly id: string; readonly name: string }[];
  readonly disabledReasons?: Readonly<Record<string, string>>;
  readonly moments?: readonly string[];
  readonly epilogues?: readonly string[];
}
export interface ContentValidationOptions {
  readonly profile?: 'playable' | 'synthetic';
  readonly catalog?: ValidationCatalog;
}
export interface ContentIssue {
  readonly path: string;
  readonly rule: string;
}
