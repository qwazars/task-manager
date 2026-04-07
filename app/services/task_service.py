from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.task import Task
from app.core import errors


def create_task(db: Session, title: str, description: str, completed: bool, user_id: int):
    task = Task(title=title, description=description, completed=completed, user_id=user_id)
    try:
        db.add(task)
        db.commit()
        db.refresh(task)
    except IntegrityError:
        db.rollback()
        raise errors.BadRequest()
    return task


def get_tasks(db: Session):
    return db.query(Task).all()

def get_task(db: Session, id: int):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise errors.TaskNotFound()
    return task


def get_user_tasks(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id).all()

def update_task(db: Session, id: int, title: str, description: str, completed: bool):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise errors.TaskNotFound()
    task.title = title
    task.description = description
    task.completed = completed
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise errors.BadRequest()
    db.refresh(task)
    return task


def delete_task(db: Session, id: int):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise errors.TaskNotFound()
    db.delete(task)
    db.commit()
    return task
