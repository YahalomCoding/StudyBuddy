import { Injectable, Logger } from "@nestjs/common";
import {
  getSystemPromptWithFallback,
  LANGFUSE_PROMPT_NAMES,
} from "../ai/ai.utils";
import { startLangfuseTrace } from "../ai/langfuse-generation";
import { env } from "../env";
import { aiSyllabusDataSchema, type AiSyllabusData } from "./syllabus.schemas";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_LOGGED_CHARACTERS = 15_000;
const MAX_INPUT_SAMPLE_CHARACTERS = 3_000;
const MAX_ATTEMPTS = 2;
const MAX_LANGFUSE_INPUT_CHARACTERS = 12_000;
const MAX_LANGFUSE_OUTPUT_CHARACTERS = 15_000;

const EMPTY_COURSE: AiSyllabusData["course"] = {
  title: null,
  englishTitle: null,
  code: null,
  credits: null,
  weeklyHours: null,
  academicYearLabel: null,
  semesterLabel: null,
  semesterNumber: null,
};

export type SyllabusParseResult = {
  data: AiSyllabusData;
  parser: "ai" | "heuristic";
  warnings: string[];
};

export type SyllabusParseContext = {
  userId?: string;
  sourceFileName?: string;
  pageCount?: number;
};

type OpenRouterResponse = {
  model?: string;
  choices?: Array<{
    finish_reason?: string | null;
    native_finish_reason?: string | null;
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost?: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
  error?: {
    message?: string;
  };
};

@Injectable()
export class SyllabusAiService {
  private readonly logger = new Logger(SyllabusAiService.name);

  async parse(
    text: string,
    context: SyllabusParseContext = {},
  ): Promise<SyllabusParseResult> {
    this.logger.log(
      `Sending ${text.length} extracted characters to ${env.OPENROUTER_MODEL}`,
    );
    this.logger.debug(
      `AI input sample:\n${text.slice(0, MAX_INPUT_SAMPLE_CHARACTERS)}`,
    );

    const managedPrompt = await getSystemPromptWithFallback(
      LANGFUSE_PROMPT_NAMES.syllabusExtraction,
      this.systemPrompt(),
    );

    const langfuseTrace = startLangfuseTrace({
      name: "syllabus-import",
      userId: context.userId,
      tags: ["syllabus-import", "openrouter", managedPrompt.source],
      input: {
        sourceFileName: context.sourceFileName,
        pageCount: context.pageCount,
        characterCount: text.length,
      },
      metadata: {
        feature: "syllabus-import",
        model: env.OPENROUTER_MODEL,
        promptSource: managedPrompt.source,
        promptName: managedPrompt.promptName,
        promptVersion: managedPrompt.version,
      },
    });

    let previousFailure = "";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const content = await this.requestExtraction(
          text,
          attempt,
          previousFailure,
          managedPrompt,
          langfuseTrace,
        );

        this.logger.debug(
          `AI content, attempt ${attempt}:\n${content.slice(
            0,
            MAX_LOGGED_CHARACTERS,
          )}`,
        );

        const parsedJson = this.parseJson(content);
        this.assertExpectedRootShape(parsedJson);

        const validated = aiSyllabusDataSchema.safeParse(parsedJson);
        if (!validated.success) {
          const details = JSON.stringify(
            validated.error.format(),
            null,
            2,
          ).slice(0, 5_000);
          throw new Error(`AI JSON failed validation: ${details}`);
        }

        const cleaned = this.clean(validated.data);

        this.logger.debug(
          `AI cleaned syllabus:\n${JSON.stringify(cleaned, null, 2).slice(
            0,
            MAX_LOGGED_CHARACTERS,
          )}`,
        );

        if (!this.hasMeaningfulData(cleaned)) {
          throw new Error(
            "AI returned JSON but extracted no meaningful syllabus information",
          );
        }

        const warnings =
          attempt === 1
            ? []
            : [
                "The first AI extraction attempt was invalid, so StudyBuddy retried it.",
              ];

        await langfuseTrace.success(
          {
            parser: "ai",
            attempt,
            courseTitle: cleaned.course.title,
            lecturers: cleaned.lecturers.length,
            assessments: cleaned.assessments.length,
            topics: cleaned.topics.length,
            warnings,
          },
          { promptSource: managedPrompt.source },
        );

        return {
          data: cleaned,
          parser: "ai",
          warnings,
        };
      } catch (error) {
        previousFailure =
          error instanceof Error ? error.message : "Unknown AI extraction error";
        this.logger.warn(
          `Syllabus AI attempt ${attempt}/${MAX_ATTEMPTS} failed: ${previousFailure}`,
        );
      }
    }

    this.logger.warn(
      `Falling back to heuristic parser after ${MAX_ATTEMPTS} failed AI attempts`,
    );

    const fallbackData = this.heuristicParse(text);
    const warnings = [
      `AI extraction failed: ${previousFailure}. StudyBuddy used a basic text parser. Review every field carefully before confirming.`,
    ];

    await langfuseTrace.warning(
      {
        parser: "heuristic",
        courseTitle: fallbackData.course.title,
        assessments: fallbackData.assessments.length,
        topics: fallbackData.topics.length,
        warnings,
      },
      previousFailure || "AI extraction failed; heuristic fallback used",
      { promptSource: managedPrompt.source },
    );

    return {
      data: fallbackData,
      parser: "heuristic",
      warnings,
    };
  }

  private async requestExtraction(
    text: string,
    attempt: number,
    previousFailure: string,
    managedPrompt: {
      promptName: string;
      prompt: string;
      version?: number;
      source: "langfuse" | "local";
    },
    langfuseTrace: ReturnType<typeof startLangfuseTrace>,
  ): Promise<string> {
    const controller = new AbortController();
    const startedAt = Date.now();
    const timeout = setTimeout(
      () => controller.abort(),
      env.SYLLABUS_AI_TIMEOUT_MS,
    );

    let generation: ReturnType<
      ReturnType<typeof startLangfuseTrace>["startGeneration"]
    > | null = null;

    try {
      const retryInstruction =
        attempt === 1
          ? ""
          : [
              "",
              "This is a retry.",
              `The previous response was rejected because: ${previousFailure.slice(
                0,
                1_000,
              )}`,
              "Return one complete JSON object with the exact root keys.",
              'Do not use JSON Pointer keys such as "/assessments".',
              "Never place an unescaped ASCII double quote inside a JSON string.",
              "For Hebrew abbreviations, use Hebrew gershayim ״.",
              "Examples: ד״ר, תשפ״ו, נ״ז and ש״ס.",
            ].join("\n");

      const userPrompt = [
        "Extract the syllabus into one compact JSON object.",
        "Return JSON only. Do not use markdown, explanations, JSON Patch, or JSON Pointer paths.",
        "Every property name must be a normal property name, for example assessments, not /assessments.",
        "Never place an unescaped ASCII double quote inside a JSON string.",
        "For Hebrew abbreviations use Hebrew gershayim ״, for example ד״ר and תשפ״ו.",
        retryInstruction,
        "",
        "--- BEGIN SYLLABUS ---",
        text,
        "--- END SYLLABUS ---",
      ].join("\n");

      generation = langfuseTrace.startGeneration({
        name: `syllabus-extraction-attempt-${attempt}`,
        provider: "openrouter",
        model: env.OPENROUTER_MODEL,
        promptName:
          managedPrompt.source === "langfuse"
            ? managedPrompt.promptName
            : undefined,
        promptVersion: managedPrompt.version,
        modelParameters: {
          temperature: 0,
          topP: 0.1,
          maxTokens: 8_000,
          reasoningEffort: "none",
        },
        input: {
          system: managedPrompt.prompt,
          user: userPrompt.slice(0, MAX_LANGFUSE_INPUT_CHARACTERS),
          inputTruncated:
            userPrompt.length > MAX_LANGFUSE_INPUT_CHARACTERS,
        },
        metadata: {
          attempt,
          promptSource: managedPrompt.source,
          characterCount: text.length,
        },
      });

      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-OpenRouter-Title": "StudyBuddy Syllabus Import",
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          temperature: 0,
          top_p: 0.1,
          max_tokens: 8_000,
          reasoning: {
            effort: "none",
            exclude: true,
          },
          messages: [
            {
              role: "system",
              content: managedPrompt.prompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      });

      const rawResponseBody = await response.text();
      let payload: OpenRouterResponse;

      try {
        payload = JSON.parse(rawResponseBody) as OpenRouterResponse;
      } catch {
        throw new Error(
          `OpenRouter returned invalid response JSON: ${rawResponseBody.slice(0, 500)}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          payload.error?.message ?? `OpenRouter returned HTTP ${response.status}`,
        );
      }

      const choice = payload.choices?.[0];
      const content = choice?.message?.content;

      this.logger.log(
        `OpenRouter attempt=${attempt}, HTTP=${response.status}, ` +
          `durationMs=${Date.now() - startedAt}, ` +
          `model=${payload.model ?? env.OPENROUTER_MODEL}, ` +
          `finishReason=${choice?.finish_reason ?? "unknown"}, ` +
          `promptTokens=${payload.usage?.prompt_tokens ?? 0}, ` +
          `completionTokens=${payload.usage?.completion_tokens ?? 0}, ` +
          `reasoningTokens=${
            payload.usage?.completion_tokens_details?.reasoning_tokens ?? 0
          }, cost=${payload.usage?.cost ?? 0}`,
      );

      if (!content?.trim()) {
        throw new Error("The AI returned an empty response");
      }

      if (choice?.finish_reason === "length") {
        throw new Error("The AI response reached the output token limit");
      }

      if (choice?.finish_reason === "error") {
        throw new Error(
          `The provider stopped with an error (${choice.native_finish_reason ?? "unknown"})`,
        );
      }

      generation.success({
        output: content.slice(0, MAX_LANGFUSE_OUTPUT_CHARACTERS),
        durationMs: Date.now() - startedAt,
        finishReason: choice?.finish_reason,
        usage: {
          inputTokens: payload.usage?.prompt_tokens,
          outputTokens: payload.usage?.completion_tokens,
          totalTokens: payload.usage?.total_tokens,
          cost: payload.usage?.cost,
        },
        metadata: {
          nativeFinishReason: choice?.native_finish_reason,
          outputTruncated:
            content.length > MAX_LANGFUSE_OUTPUT_CHARACTERS,
        },
      });

      return content;
    } catch (error) {
      generation?.error(error, {
        attempt,
        durationMs: Date.now() - startedAt,
      });

      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message === "This operation was aborted")
      ) {
        throw new Error(
          `OpenRouter did not respond within ${Math.round(
            env.SYLLABUS_AI_TIMEOUT_MS / 1_000,
          )} seconds`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private systemPrompt(): string {
    return `You are a deterministic university-syllabus data extractor.

The source may be Hebrew and may contain mixed RTL/LTR text. PDF extraction may move punctuation, numbers, percentages, or colons. Infer values from labels and nearby text, but never invent missing information.

Important Hebrew labels:
- שם הקורס = course title
- שם הקורס באנגלית = English course title
- קוד הקורס = course code
- מספר נ\"ז = credits
- מספר ש\"ס = weekly hours
- שנה\"ל = academic year
- סמסטר = semester
- מרצה/ים = lecturers
- דרישות קדם = prerequisites
- תיאור הקורס = description
- שיטת ההוראה = teaching method
- תוצרי למידה = learning outcomes
- מדיניות המרצה = policies
- תנאים לעמידה בדרישות הקורס = assessments
- תכנית הקורס = topics
- הצהרת מדיניות השימוש בבינה מלאכותית בקורס = AI policy
- רשימה ביבליוגרפית = bibliography

Rules:
1. Output exactly one complete JSON object and nothing else.
2. Use the exact property names shown below. Never prefix a property with /. Never return JSON Patch operations.
3. Use null for missing scalar values and [] for missing arrays.
4. Never invent dates. dueDate is ISO YYYY-MM-DD only when an explicit date appears.
5. assessment.kind: assignment, exam, project, presentation, participation, lab, or other.
6. submissionMode: individual, group, or unknown.
7. Hebrew semester א=1, ב=2, ג=3 when clear.
8. Keep bibliography entries and long policies concise enough to fit in the response while preserving the useful information.
9. The root object must contain all root properties, including course, lecturers, assessments, and topics.
10. Never place an unescaped ASCII double quote inside a JSON string.
11. For Hebrew abbreviations, use Hebrew gershayim ״ instead of ASCII double quotes.
12. Write ד״ר, תשפ״ו, נ״ז and ש״ס, not forms containing an unescaped ASCII double quote.

Required JSON shape:
{
  "sourceLanguage": null,
  "institution": null,
  "faculty": null,
  "course": {
    "title": null,
    "englishTitle": null,
    "code": null,
    "credits": null,
    "weeklyHours": null,
    "academicYearLabel": null,
    "semesterLabel": null,
    "semesterNumber": null
  },
  "lecturers": [],
  "prerequisites": [],
  "description": null,
  "teachingMethod": null,
  "learningOutcomes": [],
  "policies": [],
  "assessments": [],
  "topics": [],
  "aiPolicy": null,
  "bibliography": [],
  "notes": []
}

Lecturer item shape:
{"name":null,"email":null,"phone":null,"officeHours":null,"location":null}
Assessment item shape:
{"title":null,"kind":"other","weightPercent":null,"submissionMode":"unknown","groupSize":null,"requiredPages":null,"dueDate":null,"notes":null}
Topic item shape:
{"order":null,"title":null}`;
  }

  private parseJson(content: string): unknown {
    const normalized = content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const jsonCandidate = this.extractJsonObject(normalized);

    try {
      return JSON.parse(jsonCandidate);
    } catch (initialError) {
      const repairedCandidate =
        this.repairHebrewAbbreviationQuotes(jsonCandidate);

      if (repairedCandidate !== jsonCandidate) {
        this.logger.warn(
          "The AI returned unescaped quotes inside Hebrew abbreviations; StudyBuddy repaired them locally.",
        );
      }

      try {
        return JSON.parse(repairedCandidate);
      } catch (repairedError) {
        const initialMessage = this.errorMessage(initialError);
        const repairedMessage = this.errorMessage(repairedError);

        this.logger.warn(
          `JSON parsing failed. Initial error: ${initialMessage}. ` +
            `After local repair: ${repairedMessage}`,
        );

        throw new Error(
          `The AI response contained malformed JSON: ${repairedMessage}`,
        );
      }
    }
  }

  private extractJsonObject(content: string): string {
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("The AI response did not contain a JSON object");
    }

    return content.slice(firstBrace, lastBrace + 1);
  }

  private repairHebrewAbbreviationQuotes(content: string): string {
    /*
     * Small models sometimes generate valid-looking Hebrew text such as ד"ר
     * inside JSON without escaping the ASCII quote. That quote closes the JSON
     * string early. Replacing only quotes positioned between Hebrew letters is
     * safe for the JSON structure and preserves the intended Hebrew text.
     *
     * Examples:
     * ד"ר   -> ד״ר
     * תשפ"ו -> תשפ״ו
     * נ"ז   -> נ״ז
     * ש"ס   -> ש״ס
     */
    return content.replace(
      /([\u0590-\u05FF])"(?=[\u0590-\u05FF])/g,
      "$1״",
    );
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown JSON error";
  }

  private assertExpectedRootShape(value: unknown): void {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("The AI response root is not an object");
    }

    const object = value as Record<string, unknown>;
    const keys = Object.keys(object);

    if (keys.some((key) => key.startsWith("/"))) {
      throw new Error(
        `The AI returned JSON Pointer keys instead of fields: ${keys.join(", ")}`,
      );
    }

    if (!("course" in object)) {
      throw new Error(
        `The AI returned an unexpected root structure: ${keys.join(", ") || "no keys"}`,
      );
    }
  }

  private clean(data: AiSyllabusData): AiSyllabusData {
    const cleanList = (items: string[]): string[] =>
      items.map((item) => item.trim()).filter(Boolean);

    return {
      ...data,
      course: { ...EMPTY_COURSE, ...data.course },
      lecturers: data.lecturers.filter((lecturer) =>
        Object.values(lecturer).some(Boolean),
      ),
      prerequisites: cleanList(data.prerequisites),
      learningOutcomes: cleanList(data.learningOutcomes),
      policies: cleanList(data.policies),
      bibliography: cleanList(data.bibliography),
      notes: cleanList(data.notes),
      assessments: data.assessments
        .filter((assessment) => Boolean(assessment.title?.trim()))
        .map((assessment) => ({
          ...assessment,
          title: assessment.title?.trim() ?? null,
          dueDate: this.normalizeExplicitDate(assessment.dueDate),
        })),
      topics: data.topics
        .filter((topic) => Boolean(topic.title?.trim()))
        .map((topic) => ({
          ...topic,
          title: topic.title?.trim() ?? null,
        })),
    };
  }

  private hasMeaningfulData(data: AiSyllabusData): boolean {
    const textFields = [
      data.sourceLanguage,
      data.institution,
      data.faculty,
      data.course.title,
      data.course.englishTitle,
      data.course.code,
      data.course.academicYearLabel,
      data.course.semesterLabel,
      data.description,
      data.teachingMethod,
      data.aiPolicy,
    ];

    return (
      textFields.some(
        (value) => typeof value === "string" && value.trim().length > 0,
      ) ||
      data.course.credits !== null ||
      data.course.weeklyHours !== null ||
      data.course.semesterNumber !== null ||
      data.lecturers.length > 0 ||
      data.prerequisites.length > 0 ||
      data.learningOutcomes.length > 0 ||
      data.policies.length > 0 ||
      data.assessments.length > 0 ||
      data.topics.length > 0 ||
      data.bibliography.length > 0 ||
      data.notes.length > 0
    );
  }

  private normalizeExplicitDate(value: string | null): string | null {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const parsed = new Date(`${value}T12:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? null : value;
  }

  private heuristicParse(text: string): AiSyllabusData {
    const title = this.firstMatch(
      text,
      /שם הקורס(?!\s+באנגלית)\s*:?\s*([^\n]+)/i,
    );
    const englishTitle = this.firstMatch(
      text,
      /שם הקורס באנגלית\s*:?\s*([^\n]+)/i,
    );
    const code = this.firstMatch(text, /קוד הקורס\s*:?\s*([^\n]+)/i);
    const credits = this.numberMatch(
      text,
      /מספר נ["״']?ז\s*:?\s*([\d.]+)/i,
    );
    const weeklyHours = this.numberMatch(
      text,
      /מספר ש["״']?ס\s*:?\s*([\d.]+)/i,
    );
    const semesterLabel = this.firstMatch(text, /סמסטר\s*:?\s*([^\n]+)/i);
    const academicYearLabel = this.firstMatch(
      text,
      /שנה["״']?ל\s*:?\s*([^\s\n]+)/i,
    );
    const faculty = this.firstMatch(
      text,
      /פקולטה\s*\/\s*בית ספר\s*:?\s*([^\n]+)/i,
    );
    const lecturerName = this.firstMatch(
      text,
      /מרצה\s*\/\s*ים\s*:?\s*([^\n]+)/i,
    );
    const email =
      text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;

    const description = this.extractSection(
      text,
      ["תיאור הקורס ומטרותיו", "תיאור הקורס"],
      ["שיטת ההוראה"],
    );
    const teachingMethod = this.extractSection(
      text,
      ["שיטת ההוראה"],
      ["תוצרי למידה"],
    );
    const learningOutcomes = this.sectionLines(
      text,
      ["תוצרי למידה"],
      ["מדיניות המרצה", "תנאים לעמידה"],
    );
    const topics = this.sectionLines(
      text,
      ["תכנית הקורס"],
      ["הצהרת מדיניות", "רשימה ביבליוגרפית"],
    ).map((topic, index) => ({ order: index + 1, title: topic }));
    const bibliography = this.sectionLines(text, ["רשימה ביבליוגרפית"], []);

    return this.clean(
      aiSyllabusDataSchema.parse({
        sourceLanguage: /[\u0590-\u05FF]/.test(text) ? "Hebrew" : null,
        institution:
          text.split("\n").find((line) => line.trim().length > 5) ?? null,
        faculty,
        course: {
          ...EMPTY_COURSE,
          title,
          englishTitle,
          code,
          credits,
          weeklyHours,
          academicYearLabel,
          semesterLabel,
          semesterNumber: this.parseSemesterNumber(semesterLabel),
        },
        lecturers:
          lecturerName || email
            ? [
                {
                  name: lecturerName,
                  email,
                  phone: null,
                  officeHours: null,
                  location: null,
                },
              ]
            : [],
        prerequisites: this.sectionLines(text, ["דרישות קדם"], ["תיאור הקורס"]),
        description,
        teachingMethod,
        learningOutcomes,
        policies: this.sectionLines(
          text,
          ["מדיניות המרצה"],
          ["תנאים לעמידה", "תכנית הקורס"],
        ),
        assessments: [],
        topics,
        aiPolicy: this.extractSection(
          text,
          ["הצהרת מדיניות השימוש בבינה מלאכותית בקורס"],
          ["רשימה ביבליוגרפית"],
        ),
        bibliography,
        notes: [],
      }),
    );
  }

  private firstMatch(text: string, pattern: RegExp): string | null {
    return text.match(pattern)?.[1]?.trim() || null;
  }

  private numberMatch(text: string, pattern: RegExp): number | null {
    const rawValue = text.match(pattern)?.[1];
    if (!rawValue) return null;
    const value = Number(rawValue);
    return Number.isFinite(value) ? value : null;
  }

  private parseSemesterNumber(label: string | null): number | null {
    if (!label) return null;
    if (/\b3\b|ג/.test(label)) return 3;
    if (/\b2\b|ב/.test(label)) return 2;
    if (/\b1\b|א/.test(label)) return 1;
    return null;
  }

  private extractSection(
    text: string,
    startHeadings: string[],
    endHeadings: string[],
  ): string | null {
    const lines = this.sectionLines(text, startHeadings, endHeadings);
    return lines.length > 0 ? lines.join("\n") : null;
  }

  private sectionLines(
    text: string,
    startHeadings: string[],
    endHeadings: string[],
  ): string[] {
    const lines = text.split("\n").map((line) => line.trim());
    const startIndex = lines.findIndex((line) =>
      startHeadings.some((heading) => line.includes(heading)),
    );
    if (startIndex === -1) return [];

    let endIndex = lines.length;
    if (endHeadings.length > 0) {
      const relativeEndIndex = lines
        .slice(startIndex + 1)
        .findIndex((line) =>
          endHeadings.some((heading) => line.includes(heading)),
        );
      if (relativeEndIndex >= 0) {
        endIndex = startIndex + 1 + relativeEndIndex;
      }
    }

    return lines
      .slice(startIndex + 1, endIndex)
      .filter((line) => line.length > 2)
      .filter((line) => !/^[-–—]+$/.test(line))
      .slice(0, 100);
  }
}