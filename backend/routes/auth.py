from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os

router = APIRouter()

MOCK_PATH = os.path.join(os.path.dirname(__file__), "../../mock/login.json")

def read_users():
    with open(MOCK_PATH, "r") as f:
        return json.load(f)

def write_users(users):
    with open(MOCK_PATH, "w") as f:
        json.dump(users, f, indent=2)

class LoginRequest(BaseModel):
    username: str
    password: str

class NewUser(BaseModel):
    username: str
    password: str
    isAdmin: bool = False

class UpdateUser(BaseModel):
    username: str | None = None
    password: str | None = None
    isAdmin: bool | None = None

@router.post("/login")
def login(request: LoginRequest):
    users = read_users()
    user = next((u for u in users if u["username"] == request.username and u["password"] == request.password), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"id": user["id"], "username": user["username"], "isAdmin": user["isAdmin"]}

@router.get("/users")
def get_users():
    return read_users()

@router.post("/users")
def add_user(new_user: NewUser):
    users = read_users()
    if any(u["username"] == new_user.username for u in users):
        raise HTTPException(status_code=400, detail="Username already exists")
    user = {
        "id": str(len(users) + 1),
        "username": new_user.username,
        "password": new_user.password,
        "isAdmin": new_user.isAdmin
    }
    users.append(user)
    write_users(users)
    return user

@router.patch("/users/{user_id}")
def update_user(user_id: str, data: UpdateUser):
    users = read_users()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.username is not None:
        user["username"] = data.username
    if data.password is not None:
        user["password"] = data.password
    if data.isAdmin is not None:
        user["isAdmin"] = data.isAdmin
    write_users(users)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    users = read_users()
    users = [u for u in users if u["id"] != user_id]
    write_users(users)
    return {"message": "User deleted"}