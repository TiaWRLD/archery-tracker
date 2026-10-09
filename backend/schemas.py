from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

NOTE_MAX = 300


class Base(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)


class SessionInfo(Base):
    date: str
    distanceM: float
    arrowsPerEnd: int
    face: Optional[str] = None
    bow: Optional[str] = None
    feeling: Optional[int] = Field(None, ge=1, le=5)  # 1 = peggiore, 5 = migliore
    note: Optional[str] = None

    @field_validator("note")
    @classmethod
    def cut_note(cls, v):
        if v is None:
            return None
        v = v.strip()[:NOTE_MAX]
        return v or None


class Totals(Base):
    points: int
    arrows: int
    avgPerArrow: float
    misses: int
    distribution: dict[str, int] = {}


class End(Base):
    points: int
    avg: float


class Change(Base):
    from_: float = Field(alias="from")
    to: float
    diff: float
    label: str


class Grouping(Base):
    arrowsUsed: int
    arrowsTotal: int
    spreadCm: float
    radiusCm: float
    driftXCm: float
    driftYCm: float
    driftX: Literal["left", "right", "centered"]
    driftY: Literal["high", "low", "centered"]


class CoachRequest(Base):
    lang: Literal["it", "en"] = "it"
    session: SessionInfo
    totals: Totals
    ends: list[End] = []
    trend: Optional[Change] = None
    fatigue: Optional[Change] = None
    grouping: Optional[Grouping] = None


class ExerciseOut(BaseModel):
    id: str
    title: str
    how: str


class CoachResponse(BaseModel):
    comment: str
    exercises: list[ExerciseOut]