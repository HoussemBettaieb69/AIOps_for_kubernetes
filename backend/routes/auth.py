from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.db_services import get_collection


router = APIRouter()

def fix_id(doc):
    doc["_id"] = str(doc["_id"])
    return doc

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
    col = get_collection("login")
    user = col.find_one({"username": request.username, "password": request.password})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"id": user["id"], "username": user["username"], "isAdmin": user["isAdmin"]}

@router.get("/users")
def get_users():
    col = get_collection("login")
    return [fix_id(u) for u in col.find()]

@router.post("/users")
def add_user(new_user: NewUser):
    col = get_collection("login")
    if col.find_one({"username": new_user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    existing_ids = {int(u["id"]) for u in col.find({}, {"id": 1})}
    new_id=1
    while new_id in existing_ids  :
        new_id +=1 
    new_id = str(new_id)    
    user = {
        "id": new_id,
        "username": new_user.username,
        "password": new_user.password,
        "isAdmin": new_user.isAdmin
    }
    col.insert_one(user)
    return fix_id(user)

@router.patch("/users/{user_id}")
def update_user(user_id: str, data: UpdateUser):
    col = get_collection("login")
    update = {}
    if data.username is not None:
        update["username"] = data.username
    if data.password is not None:
        update["password"] = data.password
    if data.isAdmin is not None:
        update["isAdmin"] = data.isAdmin
    result = col.update_one({"id": user_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return fix_id(col.find_one({"id": user_id}))

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    col = get_collection("login")
    col.delete_one({"id": user_id})
    return {"message": "User deleted"}