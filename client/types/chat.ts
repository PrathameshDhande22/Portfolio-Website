export type ChatRole = "human" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ChatAskRequest {
  requestId: string;
  threadId: string | null;
  messages: ChatTurn[];
}

export type PlannerAction = "respond" | "retrieve";

export interface MetaEvent {
  thread_id: string;
}

export interface PlanEvent {
  action: PlannerAction;
  question: string;
  sources: string[];
  semantic: boolean;
}

export interface DeltaEvent {
  content: string;
}

export interface UsageEvent {
  stage: "planner" | "answer";
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface DoneEvent {
  thread_id: string;
  action: PlannerAction;
}

export interface ErrorEvent {
  message: string;
}

export type ChatEvent =
  | { event: "meta"; data: MetaEvent }
  | { event: "plan"; data: PlanEvent }
  | { event: "delta"; data: DeltaEvent }
  | { event: "usage"; data: UsageEvent }
  | { event: "done"; data: DoneEvent }
  | { event: "error"; data: ErrorEvent };
