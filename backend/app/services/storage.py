import json
import os
from typing import List, Dict, Optional, Any
from datetime import datetime
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.config import settings
from app.models.schemas import WeatherFileInfo

class StorageClient:
    def upload_json(self, filename: str, data: Dict[str, Any]) -> str:
        raise NotImplementedError
        
    def list_files(self) -> List[WeatherFileInfo]:
        raise NotImplementedError
        
    def get_file(self, filename: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

class LocalStorageClient(StorageClient):
    def __init__(self, storage_dir: str):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        
    def upload_json(self, filename: str, data: Dict[str, Any]) -> str:
        filepath = os.path.join(self.storage_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return filename
        
    def list_files(self) -> List[WeatherFileInfo]:
        try:
            if not os.path.exists(self.storage_dir):
                return []
            
            files: List[WeatherFileInfo] = []
            for filename in os.listdir(self.storage_dir):
                if filename.endswith(".json"):
                    filepath = os.path.join(self.storage_dir, filename)
                    stat = os.stat(filepath)
                    files.append(WeatherFileInfo(
                        name=filename,
                        size=stat.st_size,
                        created_at=datetime.fromtimestamp(stat.st_mtime).isoformat()
                    ))
            
            # Sort by creation time descending
            files.sort(key=lambda x: x.created_at, reverse=True)
            return files
            
        except Exception as e:
            print(f"Error listing files: {e}")
            return []
        
    def get_file(self, filename: str) -> Optional[Dict[str, Any]]:
        filepath = os.path.join(self.storage_dir, filename)
        if not os.path.exists(filepath):
            return None
            
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

class S3StorageClient(StorageClient):
    def __init__(self, bucket_name: str, endpoint_url: str, access_key: str, secret_key: str):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key
        )
    
    def upload_json(self, filename: str, data: Dict[str, Any]) -> str:
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=json.dumps(data),
                ContentType='application/json'
            )
            return filename
        except ClientError as e:
            print(f"S3 Upload Error: {e}")
            raise
            
    def get_file(self, filename: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=filename)
            content = response['Body'].read().decode('utf-8')
            return json.loads(content)
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                return None
            raise

    def list_files(self) -> List[WeatherFileInfo]:
        try:
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
            files: List[WeatherFileInfo] = []
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    if obj['Key'].endswith('.json'):
                        files.append(WeatherFileInfo(
                            name=obj['Key'],
                            size=obj['Size'],
                            created_at=obj['LastModified'].isoformat()
                        ))
            
            # Sort descending
            files.sort(key=lambda x: x.created_at, reverse=True)
            return files
        except ClientError as e:
            print(f"S3 List Error: {e}")
            return []

def create_storage_client() -> StorageClient:
    """Factory to create the appropriate storage client based on environment."""
    if settings.R2_ENDPOINT_URL:
        # Use S3/R2 client if endpoint is configured
        # Note: Boto3 is required for S3 usage.
        return S3StorageClient(
            bucket_name=settings.R2_BUCKET_NAME or "",
            endpoint_url=settings.R2_ENDPOINT_URL or "",
            access_key=settings.R2_ACCESS_KEY_ID or "",
            secret_key=settings.R2_SECRET_ACCESS_KEY or ""
        )
    else:
        # Fallback to local storage for testing/development
        return LocalStorageClient(settings.LOCAL_STORAGE_DIR or "./data")

# Global storage instance
storage: StorageClient = LocalStorageClient("./data") # Initialize with default to satisfy mypy

def init_storage():
    global storage
    storage = create_storage_client()
