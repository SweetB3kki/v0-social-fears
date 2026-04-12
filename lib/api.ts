import type { InstrumentKind } from "@/lib/instruments";
import type { LiebowitzSituationAnswer } from "@/lib/assessment";

export type ParticipantRegistrationPayload = {
  lastName: string;
  firstName: string;
  groupCode: string;
};

export type ParticipantRegistrationResponse = {
  participantId: string;
  groupId: string;
  groupCode: string;
  displayName: string;
  alreadyCompleted: boolean;
  isAdminRetake: boolean;
};

export type SubmitResponseItem = {
  instrument: InstrumentKind;
  questionKey: string;
  answer: unknown;
};

export type SubmitPayload = {
  participantId: string;
  groupId: string;
  meta: {
    startedAt: string;
    durationSeconds: number;
  };
  responses: SubmitResponseItem[];
};

export type TestDraft = {
  socialAnxiety: Record<string, number>;
  liebowitz: Record<string, LiebowitzSituationAnswer>;
  authorSocialFears: Record<string, number>;
};

export async function registerParticipant(
  payload: ParticipantRegistrationPayload,
): Promise<{ success: true; data: ParticipantRegistrationResponse } | { success: false; error: string }> {
  return requestJson("/api/participant/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchParticipantStatus(
  participantId: string,
): Promise<{ success: true; data: ParticipantRegistrationResponse } | { success: false; error: string }> {
  return requestJson(`/api/participant/${participantId}`, { method: "GET" });
}

export async function submitAssessment(
  payload: SubmitPayload,
): Promise<{ success: true; data: { sessionId: string } } | { success: false; error: string }> {
  return requestJson("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const response = await fetch(input, init);
    const text = await response.text();
    let parsed = {} as T & { error?: string };

    if (text) {
      try {
        parsed = JSON.parse(text) as T & { error?: string };
      } catch {
        if (!response.ok) {
          return {
            success: false,
            error: `HTTP ${response.status}: ${text.slice(0, 180) || "Сервер вернул некорректный ответ."}`,
          };
        }

        return {
          success: false,
          error: "Сервер вернул некорректный JSON-ответ.",
        };
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: parsed?.error ?? text ?? `HTTP ${response.status}`,
      };
    }

    return { success: true, data: parsed as T };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Не удалось выполнить запрос.",
    };
  }
}
