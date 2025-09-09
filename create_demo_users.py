#!/usr/bin/env python3
"""
Script to create demo users for SIG-TE system
"""
import asyncio
import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from server import hash_password, User, UserRole, StatusEnum
from datetime import datetime

async def create_demo_users():
    """Create demo users for testing"""
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'test_database')]
    
    demo_users = [
        {
            "nome": "Administrador Demo",
            "email": "admin@sigte.com",
            "celular": "(61) 99999-0001",
            "role": UserRole.ADMIN,
            "senha": "admin123"
        },
        {
            "nome": "Secretário Demo",
            "email": "secretario@sigte.com", 
            "celular": "(61) 99999-0002",
            "role": UserRole.SECRETARIO,
            "senha": "sec123"
        }
    ]
    
    for user_data in demo_users:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        if existing_user:
            print(f"✅ User {user_data['email']} already exists")
            continue
        
        # Create user
        user = User(
            nome=user_data["nome"],
            email=user_data["email"],
            celular=user_data["celular"],
            role=user_data["role"],
            status=StatusEnum.ATIVO,
            senha_hash=hash_password(user_data["senha"])
        )
        
        await db.users.insert_one(user.dict())
        print(f"✅ Created demo user: {user_data['email']} (Role: {user_data['role']})")
    
    client.close()
    print("🎉 Demo users creation completed!")

if __name__ == "__main__":
    asyncio.run(create_demo_users())