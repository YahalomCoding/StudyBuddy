import type { QueryClient } from "@tanstack/react-query";
import {
    type HomeDashboardResponse,
    homeDashboardQueryKey,
} from "../../api/home";

type DashboardMutationContext = { previousDashboard?: HomeDashboardResponse };

const applyOptimisticDashboardUpdate = async (
  queryClient: QueryClient,
  updater: (dashboard: HomeDashboardResponse) => HomeDashboardResponse
): Promise<DashboardMutationContext> => {
  await queryClient.cancelQueries({ queryKey: homeDashboardQueryKey });

  const previousDashboard = queryClient.getQueryData<HomeDashboardResponse>(
    homeDashboardQueryKey
  );

  queryClient.setQueryData<HomeDashboardResponse>(
    homeDashboardQueryKey,
    (dashboard) => {
      if (!dashboard) {
        return dashboard;
      }

      return updater(dashboard);
    }
  );

  return { previousDashboard };
};

export const applyOptimisticTodoDoneUpdate = async (
  queryClient: QueryClient,
  id: string,
  done: boolean
): Promise<DashboardMutationContext> => {
  return applyOptimisticDashboardUpdate(queryClient, (dashboard) => ({
    ...dashboard,
    todos: dashboard.todos.map((todo) =>
      todo.id === id ? { ...todo, done } : todo
    ),
  }));
};

export const applyOptimisticTodoEstimatedTimeUpdate = async (
  queryClient: QueryClient,
  id: string,
  estimatedTimeValue: number,
  estimatedTimeUnit: "minutes" | "hours" | "days"
): Promise<DashboardMutationContext> => {
  return applyOptimisticDashboardUpdate(queryClient, (dashboard) => ({
    ...dashboard,
    todos: dashboard.todos.map((todo) =>
      todo.id === id
        ? {
            ...todo,
            estimatedTime: {
              value: estimatedTimeValue,
              unit: estimatedTimeUnit,
            },
          }
        : todo
    ),
  }));
};

export const applyOptimisticAssignmentUpdate = async (
  queryClient: QueryClient,
  id: string,
  payload: {
    status?: "not started" | "active" | "done";
    type?: "homework" | "practice" | "project" | "report" | "lab";
  }
): Promise<DashboardMutationContext> => {
  return applyOptimisticDashboardUpdate(queryClient, (dashboard) => ({
    ...dashboard,
    assignments: dashboard.assignments.map((assignment) =>
      assignment.id === id
        ? {
            ...assignment,
            ...(payload.status ? { status: payload.status } : {}),
            ...(payload.type ? { type: payload.type } : {}),
          }
        : assignment
    ),
  }));
};

export const rollbackOptimisticDashboardUpdate = (
  queryClient: QueryClient,
  previousDashboard?: HomeDashboardResponse
): void => {
  if (!previousDashboard) {
    return;
  }

  queryClient.setQueryData(homeDashboardQueryKey, previousDashboard);
};

export const rollbackOptimisticTodoDoneUpdate = (
  queryClient: QueryClient,
  previousDashboard?: HomeDashboardResponse
): void => {
  rollbackOptimisticDashboardUpdate(queryClient, previousDashboard);
};