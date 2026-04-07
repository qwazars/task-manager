from pydantic import BaseModel


class AdminCreate(BaseModel):
    username: str
    email: str
    password: str


class AdminResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class AdminLogin(BaseModel):
    email: str
    password: str
