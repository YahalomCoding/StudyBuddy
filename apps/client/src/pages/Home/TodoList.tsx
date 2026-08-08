import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box, Checkbox, IconButton, Typography } from "@mui/material";
import type { TodoItem } from "@studybuddy/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { formatDueDate, formatDuration } from "./utils";

type Props = {
  todoRows: TodoItem[];
  isInitialLoading: boolean;
  isError: boolean;
  selectedTodoId: string | null;
  hoveredTodoId: string | null;
  setSelectedTodoId: (id: string | null) => void;
  setHoveredTodoId: React.Dispatch<React.SetStateAction<string | null>>;
  onToggle: (id: string, done: boolean) => void;
  onEstimatedTimeUpdate: (id: string, value: number, unit: "minutes") => void;
  onEdit: (row: TodoItem) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
  deleteTaskMutation: UseMutationResult<unknown, unknown, string>;
};

export const TodoList = ({
  todoRows,
  isInitialLoading,
  isError,
  selectedTodoId,
  hoveredTodoId,
  setSelectedTodoId,
  setHoveredTodoId,
  onToggle,
  onEstimatedTimeUpdate,
  onEdit,
  onDelete,
  onAddTask,
  deleteTaskMutation,
}: Props) => (
  <>
    {isInitialLoading && (
      <Typography color="text.secondary" fontSize={13}>
        טוען...
      </Typography>
    )}
    {isError && (
      <Typography color="error" fontSize={13}>
        לא הצלחנו לטעון משימות כרגע
      </Typography>
    )}

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto auto",
        gap: 1,
        pb: 0.5,
        mb: 0.5,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {["שם משימה", "תאריך יעד", "בוצע", "זמן משוער", "פעולות"].map(
        (label, i) => (
          <Typography
            key={label}
            fontSize={12}
            color="text.secondary"
            textAlign={i === 2 ? "center" : "right"}
          >
            {label}
          </Typography>
        )
      )}
    </Box>

    {todoRows.map((row) => (
      <Box
        key={row.id}
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto auto",
          gap: 1,
          alignItems: "center",
          py: 0.8,
          borderBottom: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          transition: "background-color 0.18s ease",
          ...(selectedTodoId === row.id && { bgcolor: "action.selected" }),
          ...(hoveredTodoId === row.id && { bgcolor: "action.hover" }),
          "&:last-of-type": { borderBottom: "none" },
        }}
        onMouseEnter={() => setHoveredTodoId(row.id)}
        onMouseLeave={() =>
          setHoveredTodoId((prev) => (prev === row.id ? null : prev))
        }
        onClick={() => setSelectedTodoId(row.id)}
      >
        <Typography
          fontSize={13}
          sx={{
            textDecoration: row.done ? "line-through" : "none",
            color: row.done ? "text.secondary" : "text.primary",
            textAlign: "right",
          }}
        >
          {row.title}
        </Typography>

        <Typography fontSize={13} color="text.secondary" textAlign="right">
          {formatDueDate(row.dueDate)}
        </Typography>

        <Box
          display="flex"
          justifyContent="center"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={row.done}
            size="small"
            disableRipple
            onClick={(e) => {
              e.stopPropagation();
              onToggle(row.id, row.done);
            }}
            sx={{ p: 0 }}
          />
        </Box>

        <Typography
          fontSize={13}
          color="primary"
          fontWeight={500}
          textAlign="right"
          sx={{ cursor: "pointer" }}
          onClick={() => {
            const next =
              row.estimatedTime.value >= 120
                ? 15
                : row.estimatedTime.value + 15;
            onEstimatedTimeUpdate(row.id, next, "minutes");
          }}
        >
          {formatDuration(row.estimatedTime)}
        </Typography>

        <Box display="flex" justifyContent="center" gap={0.3}>
          {(selectedTodoId === row.id || hoveredTodoId === row.id) && (
            <>
              <IconButton
                size="small"
                aria-label="ערוך משימה"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
                sx={{ p: 0.4 }}
              >
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
              <IconButton
                size="small"
                aria-label="מחק משימה"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row.id);
                }}
                disabled={deleteTaskMutation.isPending}
                sx={{ p: 0.4 }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
    ))}

    <Box
      display="flex"
      alignItems="center"
      gap={0.5}
      sx={{ cursor: "pointer", color: "text.secondary", mt: 1 }}
      onClick={onAddTask}
    >
      <AddIcon fontSize="small" />
      <Typography fontSize={13}>הוסף משימה</Typography>
    </Box>
  </>
);
