from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.core import errors
from app.db.deps import get_db
from app.schemas import task as schemas_task
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/create", response_model=schemas_task.TaskResponse)
def create(task: schemas_task.TaskCreate, db: Session = Depends(get_db)):
    try:
        return task_service.create_task(db, task.title, task.description, task.completed, task.user_id)
    except errors.BadRequest:
        raise HTTPException(status_code=400, detail="Invalid task data")

@router.get("/", response_model=list[schemas_task.TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    try:
        return task_service.get_tasks(db)
    except errors.NotFound:
        raise HTTPException(status_code=404, detail="Tasks not found")
    except errors.InternalServerError:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/user/{user_id}", response_model=list[schemas_task.TaskResponse])
def get_user_tasks(user_id: int, db: Session = Depends(get_db)):
    return task_service.get_user_tasks(db, user_id)


@router.get("/{task_id}", response_model=schemas_task.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    try:
        return task_service.get_task(db, task_id)
    except errors.TaskNotFound:
        raise HTTPException(status_code=404, detail="Task not found")


@router.put("/{task_id}", response_model=schemas_task.TaskResponse)
def update_task(
    task_id: int,
    task: schemas_task.TaskCreate,
    db: Session = Depends(get_db),
):
    try:
        return task_service.update_task(db, task_id, task.title, task.description, task.completed)
    except errors.TaskNotFound:
        raise HTTPException(status_code=404, detail="Task not found")
    except errors.BadRequest:
        raise HTTPException(status_code=400, detail="Invalid task data")
    except errors.InternalServerError:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{task_id}", response_model=schemas_task.TaskResponse)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    try:
        return task_service.delete_task(db, task_id)
    except errors.TaskNotFound:
        raise HTTPException(status_code=404, detail="Task not found")
