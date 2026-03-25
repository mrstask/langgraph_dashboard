TASK_STATUSES = {
    1: "backlog",
    2: "ready",
    3: "running",
    4: "review",
    5: "done",
    6: "failed",
}

TASK_PRIORITIES = {
    1: "low",
    2: "medium",
    3: "high",
    4: "critical",
}

TASK_STATUS_TO_CODE = {name: code for code, name in TASK_STATUSES.items()}
TASK_PRIORITY_TO_CODE = {name: code for code, name in TASK_PRIORITIES.items()}
