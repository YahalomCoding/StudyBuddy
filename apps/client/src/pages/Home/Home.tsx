import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Chip, IconButton, Paper, Typography } from "@mui/material";
import { ChatBotBubble } from "../../components/Chatbot";
import { CoursesSummary } from "../../components/CoursesSummery/CoursesSummery";
import { HomeAiFeatures } from "../../components/HomeAiFeatures/HomeAiFeatures";
import { UpcomingEvents } from "../../components/UpcomingEvents";
import { AssignmentList } from "./AssignmentList";
import { HomeModals } from "./HomeModals";
import { TodoList } from "./TodoList";
import { useHomeState } from "./useHomeState";

const SectionCard = ({
  title,
  icon,
  children,
  onPrev,
  onNext,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
}) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      p: 2,
      bgcolor: "background.paper",
    }}
  >
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={1.5}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography fontWeight={600} fontSize={15}>
          {title}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <IconButton size="small" onClick={onPrev} sx={{ p: 0.3 }}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onNext} sx={{ p: 0.3 }}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
    {children}
  </Paper>
);

export const Home = () => {
  const {
    isInitialLoading,
    isError,
    modal,
    setModal,
    selectedTodoId,
    setSelectedTodoId,
    selectedAssignmentId,
    setSelectedAssignmentId,
    hoveredTodoId,
    setHoveredTodoId,
    hoveredAssignmentId,
    setHoveredAssignmentId,
    selectedCourseTitle,
    setSelectedCourseTitle,
    courseModalOpen,
    courseModalValues,
    courseDetailsOpen,
    courseDetailsCourseTitle,
    courseDetailsStudentSemesterCourseId,
    todoRows,
    filteredAssignmentRows,
    assignmentFormFields,
    assignmentEditFields,
    canCreateAssignment,
    createTaskMutation,
    deleteTaskMutation,
    deleteAssignmentMutation,
    updateTodoEstimatedTimeMutation,
    handleTodoToggle,
    handleAssignmentStatusCycle,
    handleAssignmentTypeCycle,
    handleAddTodoFromAssignment,
    openAssignmentModal,
    openTaskEditModal,
    openAssignmentEditModal,
    openCourseModal,
    handleCourseModalSave,
    handleCourseOpen,
    handleCourseDetailsClose,
    handleModalSave,
    deleteCourse,
    onCloseCourseModal,
    onChangeCourseModal,
    onChangeModal,
  } = useHomeState();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 0 }}>
      <ChatBotBubble
        exampleQuestions={["What should I do for the upcoming exams?"]}
      />

      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography fontWeight={500}>בית </Typography>
      </Box>

      <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
        {selectedCourseTitle && (
          <Box display="flex" justifyContent="flex-end" mb={1.5}>
            <Chip
              label={`מסונן לפי: ${selectedCourseTitle}`}
              onDelete={() => setSelectedCourseTitle(null)}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        <HomeAiFeatures />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1.45fr) minmax(0, 0.85fr)",
            },
            gap: 2,
          }}
        >
          <Box display="flex" flexDirection="column" gap={2}>
            <SectionCard
              title="משימות"
              icon={<CheckCircleIcon sx={{ color: "#22c55e", fontSize: 20 }} />}
            >
              <TodoList
                todoRows={todoRows}
                isInitialLoading={isInitialLoading}
                isError={isError}
                selectedTodoId={selectedTodoId}
                hoveredTodoId={hoveredTodoId}
                setSelectedTodoId={setSelectedTodoId}
                setHoveredTodoId={setHoveredTodoId}
                onToggle={handleTodoToggle}
                onEstimatedTimeUpdate={(id, value, unit) =>
                  updateTodoEstimatedTimeMutation.mutate({
                    id,
                    estimatedTimeValue: value,
                    estimatedTimeUnit: unit,
                  })
                }
                onEdit={openTaskEditModal}
                onDelete={(id) => deleteTaskMutation.mutate(id)}
                onAddTask={() => setModal({ type: "task", values: {} })}
                deleteTaskMutation={deleteTaskMutation}
              />
            </SectionCard>

            <SectionCard title="מטלות" onNext={openAssignmentModal}>
              <AssignmentList
                rows={filteredAssignmentRows}
                isInitialLoading={isInitialLoading}
                isError={isError}
                selectedId={selectedAssignmentId}
                hoveredId={hoveredAssignmentId}
                canCreateAssignment={canCreateAssignment}
                setSelectedId={setSelectedAssignmentId}
                setHoveredId={setHoveredAssignmentId}
                createTaskMutationPending={createTaskMutation.isPending}
                deleteAssignmentMutation={deleteAssignmentMutation}
                onStatusCycle={handleAssignmentStatusCycle}
                onTypeCycle={handleAssignmentTypeCycle}
                onAddTodo={handleAddTodoFromAssignment}
                onEdit={openAssignmentEditModal}
                onDelete={(id) => deleteAssignmentMutation.mutate(id)}
                onOpenModal={openAssignmentModal}
              />
            </SectionCard>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <UpcomingEvents selectedCourseTitle={selectedCourseTitle} />
            <CoursesSummary
              selectedCourseTitle={selectedCourseTitle}
              onCourseSelect={setSelectedCourseTitle}
              onCourseOpen={handleCourseOpen}
              onAddCourse={openCourseModal}
              onDeleteCourse={deleteCourse}
            />
          </Box>
        </Box>
      </Box>

      <HomeModals
        modal={modal}
        onCloseModal={() => setModal(null)}
        onChangeModal={onChangeModal}
        onSaveModal={handleModalSave}
        assignmentFields={
          modal?.editId ? assignmentEditFields : assignmentFormFields
        }
        courseModalOpen={courseModalOpen}
        courseModalValues={courseModalValues}
        onCloseCourseModal={onCloseCourseModal}
        onChangeCourseModal={onChangeCourseModal}
        onSaveCourseModal={handleCourseModalSave}
        courseDetailsOpen={courseDetailsOpen}
        courseDetailsStudentSemesterCourseId={
          courseDetailsStudentSemesterCourseId
        }
        courseDetailsCourseTitle={courseDetailsCourseTitle}
        onCloseCourseDetails={handleCourseDetailsClose}
      />
    </Box>
  );
};
