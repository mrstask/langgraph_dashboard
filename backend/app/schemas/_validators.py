from typing import Annotated, Any

from pydantic import BeforeValidator, Field


def _strip(v: Any) -> Any:
    return v.strip() if isinstance(v, str) else v


def _strip_or_none(v: Any) -> str | None:
    if not isinstance(v, str):
        return v
    stripped = v.strip()
    return stripped or None


def _normalize_labels(v: list[str]) -> list[str]:
    return sorted({item.strip() for item in v if isinstance(item, str) and item.strip()})


def _uppercase(v: Any) -> Any:
    return v.strip().upper() if isinstance(v, str) else v


StrippedStr = Annotated[str, BeforeValidator(_strip)]
StrippedStrOrNone = Annotated[str | None, BeforeValidator(_strip_or_none)]
NormalizedLabels = Annotated[list[str], BeforeValidator(_normalize_labels)]
UppercaseStr = Annotated[str, BeforeValidator(_uppercase)]
PositiveInt = Annotated[int, Field(gt=0)]
NonNegativeInt = Annotated[int, Field(ge=0)]
