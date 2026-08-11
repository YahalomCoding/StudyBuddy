import { CourseDetailsModal } from "../../components/CourseDetailsModal";
import {
  GenericFormModal,
  type FormField,
  type FormValues,
} from "../../components/GenericFormModal/GenericFormModal";
import {
  getHomeModalTitle,
  TASK_FIELDS,
  type HomeModalType,
} from "./formConfig";

type ModalState = { type: HomeModalType; values: FormValues; editId?: string };

type Props = {
  modal: ModalState | null;
  onCloseModal: () => void;
  onChangeModal: (name: string, value: string) => void;
  onSaveModal: (values: FormValues) => void;
  assignmentFields: FormField[];

  courseModalOpen: boolean;
  courseModalValues: FormValues;
  onCloseCourseModal: () => void;
  onChangeCourseModal: (name: string, value: string) => void;
  onSaveCourseModal: (values: FormValues) => void;

  courseDetailsOpen: boolean;
  courseDetailsStudentSemesterCourseId: string | null;
  courseDetailsCourseTitle: string | null;
  onCloseCourseDetails: () => void;
};

const COURSE_FORM_FIELDS: FormField[] = [
  {
    type: "text",
    name: "courseTitle",
    label: "שם הקורס",
    placeholder: "למשל: מתמטיקה",
  },
  {
    type: "number",
    name: "credits",
    label: "נקודות זכות",
    placeholder: "למשל: 3",
  },
  {
    type: "select",
    name: "semesterLabel",
    label: "סמסטר",
    options: [
      { label: "א", value: "1" },
      { label: "ב", value: "2" },
      { label: "קיץ", value: "3" },
    ],
  },
];

export const HomeModals = ({
  modal,
  onCloseModal,
  onChangeModal,
  onSaveModal,
  assignmentFields,
  courseModalOpen,
  courseModalValues,
  onCloseCourseModal,
  onChangeCourseModal,
  onSaveCourseModal,
  courseDetailsOpen,
  courseDetailsStudentSemesterCourseId,
  courseDetailsCourseTitle,
  onCloseCourseDetails,
}: Props) => (
  <>
    {modal && (
      <GenericFormModal
        open
        onClose={onCloseModal}
        title={getHomeModalTitle(modal)}
        fields={modal.type === "task" ? TASK_FIELDS : assignmentFields}
        values={modal.values}
        onChange={onChangeModal}
        onSave={onSaveModal}
        saveLabel="שמור"
        cancelLabel="ביטול"
      />
    )}

    <GenericFormModal
      open={courseModalOpen}
      onClose={onCloseCourseModal}
      title="הוסף קורס"
      fields={COURSE_FORM_FIELDS}
      values={courseModalValues}
      onChange={onChangeCourseModal}
      onSave={onSaveCourseModal}
      saveLabel="הוסף"
      cancelLabel="ביטול"
    />

    <CourseDetailsModal
      open={courseDetailsOpen}
      studentSemesterCourseId={courseDetailsStudentSemesterCourseId}
      courseTitle={courseDetailsCourseTitle}
      onClose={onCloseCourseDetails}
    />
  </>
);
