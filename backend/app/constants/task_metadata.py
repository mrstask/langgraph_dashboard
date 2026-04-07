from typing import Literal

TaskStatusName = Literal[
    "backlog", "ready", "running", "review", "done", "failed",
    "architect", "develop", "testing",
]

TaskPriorityName = Literal["low", "medium", "high", "critical"]

TASK_STATUSES: dict[int, TaskStatusName] = {
    1: "backlog",
    2: "ready",
    3: "running",
    4: "review",
    5: "done",
    6: "failed",
    7: "architect",
    8: "develop",
    9: "testing",
}

TASK_PRIORITIES: dict[int, TaskPriorityName] = {
    1: "low",
    2: "medium",
    3: "high",
    4: "critical",
}

TASK_STATUS_TO_CODE: dict[TaskStatusName, int] = {name: code for code, name in TASK_STATUSES.items()}
TASK_PRIORITY_TO_CODE: dict[TaskPriorityName, int] = {name: code for code, name in TASK_PRIORITIES.items()}
