import AddIcon from "@mui/icons-material/Add";
import AddTaskIcon from "@mui/icons-material/AddTask";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import type { AssignmentItem } from "@studybuddy/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { statusChipClass, typeChipClass } from "./style";
import {
  assignmentTypeToDisplayName,
  formatDueDate,
  getRelativeDueDate,
  isOverdue,
  relativeDueDateToDisplayName,
  statusToDisplayName,
} from "./utils";

type Props = {
  rows: AssignmentItem[];
  isInitialLoading: boolean;
  isError: boolean;
  selectedId: string | null;
  hoveredId: string | null;
  canCreateAssignment: boolean;
  setSelectedId: (id: string | null) => void;
  setHoveredId: React.Dispatch<React.SetStateAction<string | null>>;
  createTaskMutationPending: boolean;
  deleteAssignmentMutation: UseMutationResult<unknown, unknown, string>;
  onStatusCycle: (row: AssignmentItem) => void;
  onTypeCycle: (row: AssignmentItem) => void;
  onAddTodo: (row: AssignmentItem) => void;
  onEdit: (row: AssignmentItem) => void;
  onDelete: (id: string) => void;
  onOpenModal: () => void;
};

const HEADERS = [
  "סטטוס",
  "קורס",
  "שם מטלה",
  "תאריך יעד",
  "סוג",
  "ימים שנותרו",
  "לטודו",
  "פעולות",
];
const GRID = "auto auto 1fr auto auto auto auto auto";

export const AssignmentList = ({
  rows,
  isInitialLoading,
  isError,
  selectedId,
  hoveredId,
  canCreateAssignment,
  setSelectedId,
  setHoveredId,
  createTaskMutationPending,
  deleteAssignmentMutation,
  onStatusCycle,
  onTypeCycle,
  onAddTodo,
  onEdit,
  onDelete,
  onOpenModal,
}: Props) => (
  <>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 1,
        pb: 0.5,
        mb: 0.5,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {HEADERS.map((label, i) => (
        <Typography
          key={label}
          fontSize={12}
          color="text.secondary"
          textAlign={i >= 6 ? "center" : "right"}
        >
          {label}
        </Typography>
      ))}
    </Box>

    {isInitialLoading && (
      <Typography color="text.secondary" fontSize={13}>
        טוען...
      </Typography>
    )}
    {isError && (
      <Typography color="error" fontSize={13}>
        לא הצלחנו לטעון מטלות כרגע
      </Typography>
    )}

    {rows.map((row) => {
      const relativeDueDate = getRelativeDueDate(row.dueDate, row.status);
      return (
        <Box
          key={row.id}
          sx={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: 1,
            alignItems: "center",
            py: 0.8,
            borderBottom: "1px solid",
            borderColor: "divider",
            cursor: "pointer",
            transition: "background-color 0.18s ease",
            ...(selectedId === row.id && { bgcolor: "action.selected" }),
            ...(hoveredId === row.id && { bgcolor: "action.hover" }),
            "&:last-of-type": { borderBottom: "none" },
            ...(isOverdue(relativeDueDate) && {
              bgcolor: "var(--sb-home-overdue-row-bg)",
              borderColor: "var(--sb-home-overdue-row-border)",
            }),
          }}
          onMouseEnter={() => setHoveredId(row.id)}
          onMouseLeave={() =>
            setHoveredId((prev) => (prev === row.id ? null : prev))
          }
          onClick={() => setSelectedId(row.id)}
        >
          <Chip
            label={statusToDisplayName(row.status)}
            size="small"
            className={statusChipClass(row.status)}
            onClick={() => onStatusCycle(row)}
            sx={{ fontSize: 11, height: 22 }}
          />
          <Typography fontSize={12} color="text.secondary" noWrap>
            {row.course}
          </Typography>
          <Typography fontSize={13} noWrap textAlign="right">
            {row.title}
          </Typography>
          <Typography fontSize={12} color="text.secondary" noWrap>
            {formatDueDate(row.dueDate)}
          </Typography>
          <Chip
            label={assignmentTypeToDisplayName(row.type)}
            size="small"
            className={typeChipClass(row.type)}
            onClick={() => onTypeCycle(row)}
            sx={{ fontSize: 11, height: 22 }}
          />
          <Typography
            fontSize={12}
            fontWeight={500}
            textAlign="right"
            sx={{
              color: isOverdue(relativeDueDate)
                ? "var(--sb-home-overdue-text)"
                : "text.secondary",
            }}
          >
            {relativeDueDateToDisplayName(relativeDueDate)}
          </Typography>
          <Box display="flex" justifyContent="center">
            <IconButton
              size="small"
              onClick={() => onAddTodo(row)}
              disabled={createTaskMutationPending}
              aria-label="הוסף לטודו"
              sx={{ p: 0.4 }}
            >
              <AddTaskIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          <Box display="flex" justifyContent="center" gap={0.3}>
            {(selectedId === row.id || hoveredId === row.id) && (
              <>
                <IconButton
                  size="small"
                  aria-label="ערוך מטלה"
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
                  aria-label="מחק מטלה"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row.id);
                  }}
                  disabled={deleteAssignmentMutation.isPending}
                  sx={{ p: 0.4 }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      );
    })}

    <Box
      display="flex"
      alignItems="center"
      gap={0.5}
      sx={{
        cursor: canCreateAssignment ? "pointer" : "not-allowed",
        color: "text.secondary",
        opacity: canCreateAssignment ? 1 : 0.5,
        mt: 1,
      }}
      onClick={onOpenModal}
    >
      <AddIcon fontSize="small" />
      <Typography fontSize={13}>הוסף מטלה</Typography>
    </Box>
    {!canCreateAssignment && (
      <Typography color="text.secondary" fontSize={12} mt={0.5}>
        כדי להוסיף מטלה צריך קודם קורס אחד לפחות.
      </Typography>
    )}
  </>
);
