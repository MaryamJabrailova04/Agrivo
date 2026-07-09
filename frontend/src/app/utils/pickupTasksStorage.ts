import type { AuthUser } from "../auth/authStorage";
import { PICKUP_TASK_SEED } from "../data/pickupTasks";

export type PickupTaskStatus =
  | "scheduled"
  | "ready_for_pickup"
  | "driver_assigned"
  | "pickup_started"
  | "collected"
  | "delayed"
  | "cancelled";

export type PickupPriority = "high" | "medium" | "low";
export type PickupReadiness = "ready_now" | "packing" | "waiting_driver" | "delayed";
export type PickupStatusFilter = PickupTaskStatus | "all";
export type PickupPriorityFilter = PickupPriority | "all";
export type PickupTimeFilter = "today" | "next_2_hours" | "afternoon" | "tomorrow" | "week" | "all";

export interface PickupTask {
  id: string;
  taskId: string;
  status: PickupTaskStatus;
  priority: PickupPriority;
  readiness: PickupReadiness;
  assignedAt: string;
  timeCategory: "today" | "tomorrow" | "week";
  timeSlot: "morning" | "afternoon";
  pickupLocation: string;
  destination: string;
  pickupAddress: string;
  farmerName: string;
  farmerPhone: string;
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  pickupTime: string;
  pickupWindow: string;
  region: string;
  district: string;
  driverName: string;
  vehicle: string;
  notes: string;
  productKey?: string;
  sortKey?: string;
  pickupLocationLocalized?: { en: string; az: string };
  destinationLocalized?: { en: string; az: string };
  pickupAddressLocalized?: { en: string; az: string };
  notesLocalized?: { en: string; az: string };
}

export interface PickupTaskSummary {
  todaysPickups: number;
  scheduled: number;
  readyForPickup: number;
  delayed: number;
  completed: number;
}

export interface PickupReadinessSummary {
  readyNow: number;
  packingInProgress: number;
  waitingForDriver: number;
  delayedReadiness: number;
}

export interface PickupAlert {
  id: string;
  type: "delay" | "early_arrival" | "no_driver" | "ready_now" | "road_issue";
  title: string;
  description: string;
  urgency: "high" | "medium";
}

export type PickupTaskAction =
  | "assign_driver"
  | "start_pickup"
  | "mark_collected"
  | "mark_resolved"
  | "report_delay"
  | "move_to_in_transit"
  | "view_details"
  | "open_route"
  | "contact_farmer";

const STORAGE_KEY_PREFIX = "agrivo_pickup_tasks_";

export const PICKUP_STATUS_LABELS: Record<PickupTaskStatus, string> = {
  scheduled: "Scheduled",
  ready_for_pickup: "Ready for Pickup",
  driver_assigned: "Driver Assigned",
  pickup_started: "Pickup Started",
  collected: "Collected",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

export const PICKUP_PRIORITY_LABELS: Record<PickupPriority, string> = {
  high: "High priority",
  medium: "Medium",
  low: "Low",
};

export const PICKUP_TIMELINE_STEPS: PickupTaskStatus[] = [
  "scheduled",
  "driver_assigned",
  "pickup_started",
  "collected",
];

const ACTION_NEXT_STATUS: Partial<Record<PickupTaskAction, PickupTaskStatus>> = {
  assign_driver: "driver_assigned",
  start_pickup: "pickup_started",
  mark_collected: "collected",
  mark_resolved: "ready_for_pickup",
  report_delay: "delayed",
  move_to_in_transit: "collected",
};

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function seedPickupTasks(): PickupTask[] {
  return PICKUP_TASK_SEED.map((task) => ({ ...task }));
}

export function resolvePickupTasksUserId(user: AuthUser | null): string | null {
  if (!user) return null;
  return user.id || "demo_logistics";
}

export function getPickupTasks(userId: string): PickupTask[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      const seeded = seedPickupTasks();
      setPickupTasks(userId, seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as PickupTask[];
    return Array.isArray(parsed) ? parsed : seedPickupTasks();
  } catch {
    return seedPickupTasks();
  }
}

export function setPickupTasks(userId: string, tasks: PickupTask[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(tasks));
}

export function updatePickupTaskStatus(
  userId: string,
  taskId: string,
  status: PickupTaskStatus,
): PickupTask[] {
  const tasks = getPickupTasks(userId);
  const next = tasks.map((task) => (task.id === taskId ? { ...task, status } : task));
  setPickupTasks(userId, next);
  return next;
}

export function applyPickupTaskAction(
  userId: string,
  taskId: string,
  action: PickupTaskAction,
): PickupTask[] {
  const nextStatus = ACTION_NEXT_STATUS[action];
  if (!nextStatus) return getPickupTasks(userId);

  const tasks = getPickupTasks(userId);
  const next = tasks.map((task) => {
    if (task.id !== taskId) return task;

    const updated: PickupTask = { ...task, status: nextStatus };

    if (action === "assign_driver" && !task.driverName) {
      updated.driverName = "Kamran M.";
      updated.vehicle = "10-TZ-321";
      updated.readiness = "waiting_driver";
    }

    if (action === "mark_resolved") {
      updated.readiness = "ready_now";
    }

    if (action === "report_delay") {
      updated.readiness = "delayed";
    }

    return updated;
  });

  setPickupTasks(userId, next);
  return next;
}

export function computePickupTaskSummary(tasks: PickupTask[]): PickupTaskSummary {
  const activeToday = tasks.filter((task) => task.timeCategory === "today");

  return {
    todaysPickups: activeToday.filter((task) => task.status !== "cancelled").length,
    scheduled: tasks.filter(
      (task) => task.status === "scheduled" || task.status === "driver_assigned",
    ).length,
    readyForPickup: tasks.filter((task) => task.status === "ready_for_pickup").length,
    delayed: tasks.filter((task) => task.status === "delayed").length,
    completed: tasks.filter((task) => task.status === "collected").length,
  };
}

export function computePickupReadinessSummary(tasks: PickupTask[]): PickupReadinessSummary {
  const active = tasks.filter((task) => task.status !== "collected" && task.status !== "cancelled");

  return {
    readyNow: active.filter((task) => task.readiness === "ready_now").length,
    packingInProgress: active.filter((task) => task.readiness === "packing").length,
    waitingForDriver: active.filter((task) => task.readiness === "waiting_driver").length,
    delayedReadiness: active.filter((task) => task.readiness === "delayed").length,
  };
}

export function filterPickupTasks(
  tasks: PickupTask[],
  options: {
    search: string;
    status: PickupStatusFilter;
    region: string;
    timeFilter: PickupTimeFilter;
    priority: PickupPriorityFilter;
  },
): PickupTask[] {
  const query = options.search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      !query ||
      task.taskId.toLowerCase().includes(query) ||
      task.pickupLocation.toLowerCase().includes(query) ||
      task.farmerName.toLowerCase().includes(query) ||
      task.productName.toLowerCase().includes(query) ||
      task.variety.toLowerCase().includes(query);

    const matchesStatus = options.status === "all" || task.status === options.status;
    const matchesRegion = options.region === "all" || task.region === options.region;
    const matchesPriority = options.priority === "all" || task.priority === options.priority;

    const matchesTime =
      options.timeFilter === "all" ||
      (options.timeFilter === "today" && task.timeCategory === "today") ||
      (options.timeFilter === "tomorrow" && task.timeCategory === "tomorrow") ||
      (options.timeFilter === "week" && task.timeCategory === "week") ||
      (options.timeFilter === "afternoon" && task.timeSlot === "afternoon") ||
      (options.timeFilter === "next_2_hours" &&
        task.timeCategory === "today" &&
        task.timeSlot === "morning");

    return matchesSearch && matchesStatus && matchesRegion && matchesPriority && matchesTime;
  });
}

export function getPickupTaskRegions(tasks: PickupTask[]): string[] {
  return [...new Set(tasks.map((task) => task.region))].sort();
}

export function formatPickupQuantity(task: PickupTask): string {
  return `${task.quantity} ${task.unit}`;
}

export function getPrimaryPickupAction(status: PickupTaskStatus): PickupTaskAction | null {
  switch (status) {
    case "scheduled":
      return "assign_driver";
    case "ready_for_pickup":
    case "driver_assigned":
      return "start_pickup";
    case "pickup_started":
      return "mark_collected";
    case "delayed":
      return "mark_resolved";
    case "collected":
      return "move_to_in_transit";
    default:
      return null;
  }
}

export function getSecondaryPickupActions(status: PickupTaskStatus): PickupTaskAction[] {
  switch (status) {
    case "scheduled":
    case "ready_for_pickup":
    case "driver_assigned":
    case "pickup_started":
    case "delayed":
      return ["view_details", "open_route", "contact_farmer"];
    case "collected":
      return ["view_details", "open_route"];
    case "cancelled":
      return ["view_details"];
    default:
      return ["view_details"];
  }
}

export function getPickupActionLabel(action: PickupTaskAction): string {
  switch (action) {
    case "assign_driver":
      return "Assign Driver";
    case "start_pickup":
      return "Start Pickup";
    case "mark_collected":
      return "Mark Collected";
    case "mark_resolved":
      return "Mark Resolved";
    case "report_delay":
      return "Report Delay";
    case "move_to_in_transit":
      return "Move to In Transit";
    case "view_details":
      return "View Details";
    case "open_route":
      return "Open Route";
    case "contact_farmer":
      return "Contact Farmer";
    default:
      return "Action";
  }
}

export function getPickupTimelineIndex(status: PickupTaskStatus): number {
  if (status === "ready_for_pickup") return 0;
  if (status === "delayed") return 2;
  if (status === "cancelled") return -1;
  const index = PICKUP_TIMELINE_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
}

export function getUpcomingPickups(tasks: PickupTask[], limit = 5): PickupTask[] {
  return [...tasks]
    .filter((task) => task.status !== "collected" && task.status !== "cancelled")
    .sort((a, b) => a.pickupTime.localeCompare(b.pickupTime))
    .slice(0, limit);
}

export function seedPickupAlerts(): PickupAlert[] {
  return [
    {
      id: "pa-1",
      type: "delay",
      title: "Pickup delayed by 20 minutes",
      description: "Göyçay Orchard pickup is behind schedule.",
      urgency: "high",
    },
    {
      id: "pa-2",
      type: "early_arrival",
      title: "Farmer requested earlier arrival",
      description: "Hasanov Green Farm asked to arrive before 09:15.",
      urgency: "medium",
    },
    {
      id: "pa-3",
      type: "no_driver",
      title: "Driver not assigned",
      description: "Quba Apple Farm pickup still needs a driver.",
      urgency: "high",
    },
    {
      id: "pa-4",
      type: "ready_now",
      title: "Product is ready now",
      description: "Lankaran Greenhouse crates are staged for loading.",
      urgency: "medium",
    },
    {
      id: "pa-5",
      type: "road_issue",
      title: "Road issue warning",
      description: "Alternate route recommended for Gədəbəy pickup.",
      urgency: "medium",
    },
  ];
}

export function getLogisticsSectionHash(sectionId: string): string {
  if (sectionId === "overview") return "dashboard/logistics";
  return `dashboard/logistics/${sectionId}`;
}
