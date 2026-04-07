from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: str
    completed: bool
    user_id: int

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    completed: bool

    class Config:
        from_attributes = True