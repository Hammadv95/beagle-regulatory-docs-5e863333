from fastapi import FastAPI, APIRouter, UploadFile, File, Form, Header, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Admin Upload Endpoint
@api_router.post("/admin/upload")
async def admin_upload(
    title: str = Form(...),
    pdf: UploadFile = File(...),
    doc_type: Literal["state_regulation", "pms_report_requests"] = Form("state_regulation"),
    slug: Optional[str] = Form(None),
    summary: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """
    Admin endpoint to upload documents with document type selection.
    
    - doc_type: "state_regulation" (default) or "pms_report_requests"
    """
    # Simple token validation (in production, use proper auth)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization required")
    
    token = authorization.replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Validate file type
    if pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read file content
    file_content = await pdf.read()
    file_size = len(file_content)
    
    # Create document record
    doc_id = str(uuid.uuid4())
    document = {
        "id": doc_id,
        "title": title,
        "doc_type": doc_type,
        "slug": slug,
        "summary": summary,
        "filename": pdf.filename,
        "file_size": file_size,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": token[:20] + "..."  # Store truncated token for reference
    }
    
    # Store in MongoDB
    await db.documents.insert_one(document)
    
    logger.info(f"Document uploaded: {title} (type: {doc_type})")
    
    return {
        "success": True,
        "message": "Document uploaded successfully",
        "document_id": doc_id,
        "doc_type": doc_type
    }

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()