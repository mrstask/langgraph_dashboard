from pydantic import BaseModel, Field


class CountsRead(BaseModel):
    tasks: int = Field(ge=0)
    agents: int = Field(ge=0)
    runs: int = Field(ge=0)
    projects: int = Field(ge=0)
    stories: int = Field(ge=0)
