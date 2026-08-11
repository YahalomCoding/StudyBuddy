import { Alert, Box, Stack, Typography } from "@mui/material";
import type { CourseDetailsResponse } from "../../api/courses";
import { ContentSection } from "./courseDetailsUtils";

type Props = { data: CourseDetailsResponse };

export const CourseSyllabusTab = ({ data }: Props) => {
  if (!data.syllabus.exists) {
    return (
      <Alert severity="info">
        עדיין לא הועלה סילבוס לקורס הזה. פרטי הקורס והמטלות נשאבו מהמידע הקיים
        במערכת.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <ContentSection title="תוצרי למידה">
        {data.learningOutcomes.length === 0 ? (
          <Typography fontSize={13} color="text.secondary">
            לא נמצאו תוצרי למידה.
          </Typography>
        ) : (
          <Stack component="ol" spacing={1} sx={{ m: 0, pr: 2.5 }}>
            {data.learningOutcomes.map((outcome) => (
              <Typography
                key={outcome}
                component="li"
                fontSize={14}
                color="text.secondary"
                lineHeight={1.7}
              >
                {outcome}
              </Typography>
            ))}
          </Stack>
        )}
      </ContentSection>

      <ContentSection title="נושאי הקורס">
        {data.topics.length === 0 ? (
          <Typography fontSize={13} color="text.secondary">
            לא נמצאו נושאי קורס.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1,
            }}
          >
            {data.topics.map((topic) => (
              <Box
                key={topic.id}
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  py: 0.75,
                  px: 1,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: "action.hover",
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {topic.order}
                </Box>
                <Typography fontSize={13}>{topic.title}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </ContentSection>

      <ContentSection title="מדיניות הקורס">
        {data.policies.length === 0 ? (
          <Typography fontSize={13} color="text.secondary">
            לא נמצאה מדיניות קורס.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {data.policies.map((policy) => (
              <Typography
                key={policy}
                fontSize={14}
                color="text.secondary"
                lineHeight={1.7}
              >
                • {policy}
              </Typography>
            ))}
          </Stack>
        )}
      </ContentSection>

      <ContentSection title="מדיניות שימוש בבינה מלאכותית">
        <Typography fontSize={14} color="text.secondary" lineHeight={1.7}>
          {data.aiPolicy || "לא צוינה מדיניות שימוש ב־AI."}
        </Typography>
      </ContentSection>

      <ContentSection title="ביבליוגרפיה">
        {data.bibliography.length === 0 ? (
          <Typography fontSize={13} color="text.secondary">
            לא נמצאה ביבליוגרפיה.
          </Typography>
        ) : (
          <Stack spacing={0.8}>
            {data.bibliography.map((item) => (
              <Typography key={item} fontSize={13} color="text.secondary">
                • {item}
              </Typography>
            ))}
          </Stack>
        )}
      </ContentSection>
    </Stack>
  );
};
