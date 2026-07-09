const JOB_TOAST_KEY = "agrivo_job_toast";

export function consumeJobToast(): string | null {
  try {
    const message = sessionStorage.getItem(JOB_TOAST_KEY);
    if (message) sessionStorage.removeItem(JOB_TOAST_KEY);
    return message;
  } catch {
    return null;
  }
}

export function setJobToast(message: string): void {
  try {
    sessionStorage.setItem(JOB_TOAST_KEY, message);
  } catch {
    // ignore
  }
}
