from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio
import redis.asyncio as aioredis # Need async redis for websockets

router = APIRouter()

# Store active websocket connections
active_connections = []

async def subscribe_redis():
    """Background task to listen to Redis and broadcast to WebSockets. (MOCKED)"""
    pass


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            # We don't really expect clients to send messages right now for Page 4
            # We just keep the connection open to push updates
            data = await websocket.receive_text()
            # Echo back just as an example
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        active_connections.remove(websocket)
