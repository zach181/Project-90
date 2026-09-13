export type CommitmentType = "check" | "quantity" | "duration" | "photo" | "text";

export interface Commitment {
  id: string;
  title: string;
  icon: string;
  type: CommitmentType;
  /** quantity: numeric goal (e.g. 128) */
  target?: number;
  /** quantity: unit label (e.g. "oz") */
  unit?: string;
  /** quantity: increment for +/- controls */
  step?: number;
  /** duration: goal in minutes */
  targetMinutes?: number;
  /** text: placeholder guidance. Also used as the note placeholder when allowNote is set. */
  hint?: string;
  /** check: show an optional free-text note field that does not affect completion */
  allowNote?: boolean;
}

export type MissRule = "reset" | "grace" | "streak-only";

export interface Challenge {
  id: string;
  name: string;
  /** yyyy-MM-dd, local */
  startDate: string;
  totalDays: number;
  commitments: Commitment[];
  missRule: MissRule;
  /** allowed skip days when missRule === "grace" */
  graceDays: number;
  createdAt: number;
}

export interface CheckValue {
  kind: "check";
  done: boolean;
  /** optional free-text note; only used when the commitment sets allowNote */
  note?: string;
}
export interface QuantityValue {
  kind: "quantity";
  amount: number;
}
export interface DurationValue {
  kind: "duration";
  minutes: number;
}
export interface PhotoValue {
  kind: "photo";
  uri: string;
}
export interface TextValue {
  kind: "text";
  text: string;
}
export type EntryValue =
  | CheckValue
  | QuantityValue
  | DurationValue
  | PhotoValue
  | TextValue;

export interface DayLog {
  /** 1..totalDays */
  dayNumber: number;
  /** yyyy-MM-dd */
  date: string;
  entries: Record<string, EntryValue>;
  note?: string;
  /** epoch ms when the user locked the day in */
  lockedAt?: number;
}

export interface NewChallengeInput {
  name: string;
  totalDays?: number;
  missRule: MissRule;
  graceDays?: number;
  commitments: Array<Omit<Commitment, "id">>;
}

// --- Groups (backed by the server in ../../server) ---

export interface MemberStats {
  dayNumber: number;
  totalDays: number;
  streak: number;
  challengeName: string;
  updatedAt: number;
}

export interface GroupMember {
  id: string;
  name: string;
  stats: MemberStats | null;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  createdAt: number;
  members: GroupMember[];
}
