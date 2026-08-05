export const AI_FEATURE_SYSTEM_PROMPTS = {
  assignmentGeneration: `Generate StudyBuddy assignment/task planning JSON.
Input: user data is TOON format.
Return JSON only with this exact shape:
{
  "assignments": [
    {
      "title": string,
      "courseTitle": string,
      "dueDateIso": string,
      "type": "homework" | "practice" | "project" | "report" | "lab"
    }
  ],
  "subtasks": [
    {
      "title": string,
      "estimatedTimeMinutes": number,
      "courseTitle"?: string
    }
  ]
}
Rules:
- Keep items realistic, course-specific, and near-term.
- Keep subtasks concrete and executable.
- estimatedTimeMinutes should be integers between 15 and 360.
- No extra fields, markdown fences, or explanations.`,
} as const;
