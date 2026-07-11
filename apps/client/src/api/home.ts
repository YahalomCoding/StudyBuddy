import baseApi from "./baseApi";

export type HomeDashboardTodo = {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
  estimatedTime: {
    value: number;
    unit: "minutes" | "hours" | "days";
  };
};

export type HomeDashboardAssignment = {
  id: string;
  status: "not started" | "active" | "done";
  course: string;
  title: string;
  dueDate: string;
  type: "assignment" | "homework" | "practice" | "project" | "report" | "lab";
};

export type HomeDashboardUpcomingEvent = {
  id: string;
  kind: "assignment" | "exam";
  courseTitle: string;
  description: string;
  eventDate: string;
  semesterLabel: string;
};

export type HomeDashboardCourseSummary = {
  id: string;
  studentSemesterCourseId: string;
  courseTitle: string;
  semesterLabel: string;
  courseId: string;
};

export type HomeDashboardResponse = {
  todos: HomeDashboardTodo[];
  assignments: HomeDashboardAssignment[];
  upcomingEvents: HomeDashboardUpcomingEvent[];
  coursesSummary: HomeDashboardCourseSummary[];
};

export const homeDashboardQueryKey = ["home-dashboard"] as const;

export const getHomeDashboard = async (): Promise<HomeDashboardResponse> => {
  const response = await baseApi.get<HomeDashboardResponse>("/home/dashboard");
  return response.data;
};

export const updateGeneralTask = async (
  id: string,
  payload: {
    title?: string;
    dueDate?: string;
    done?: boolean;
    estimatedTimeValue?: number;
    estimatedTimeUnit?: "minutes" | "hours" | "days";
  }
) => {
  const response = await baseApi.patch(`/general-tasks/${id}`, payload);
  return response.data;
};

export const updateAssignment = async (
  id: string,
  payload: {
    title?: string;
    dueDate?: string;
    status?: "not started" | "active" | "done";
    type?:
      | "assignment"
      | "homework"
      | "practice"
      | "project"
      | "report"
      | "lab";
  }
) => {
  const response = await baseApi.patch(`/assignments/${id}`, payload);
  return response.data;
};

export const deleteGeneralTask = async (id: string) => {
  const response = await baseApi.delete(`/general-tasks/${id}`);
  return response.data;
};

export const deleteHomeAssignment = async (id: string) => {
  const response = await baseApi.delete(`/assignments/${id}`);
  return response.data;
};

export const createGeneralTask = async (payload: {
  title: string;
  dueDate: string;
  estimatedTimeValue: number;
  estimatedTimeUnit: "minutes" | "hours" | "days";
}) => {
  const response = await baseApi.post("/home/tasks", payload);
  return response.data;
};

export const createHomeAssignment = async (payload: {
  course: string;
  title: string;
  dueDate: string;
  status: "not started" | "active" | "done";
  type: "assignment" | "homework" | "practice" | "project" | "report" | "lab";
}) => {
  const response = await baseApi.post("/home/assignments", payload);
  return response.data;
};

export const createUpcomingEvent = async (payload: {
  kind: "assignment" | "exam";
  courseTitle: string;
  description: string;
  eventDate: string;
  semesterLabel: string;
}) => {
  const response = await baseApi.post("/home/events", payload);
  return response.data;
};

export const createCourseSummary = async (payload: {
  courseTitle: string;
  semesterLabel: string;
}) => {
  const response = await baseApi.post("/home/courses", payload);
  return response.data;
};
