# SAJAG AI - Backend API Documentation

## Overview

SAJAG AI is a Smart Disaster Response & Rescue Coordination Platform with a FastAPI backend. The system implements an Uber-like dispatch system for rescue operations with real-time location tracking, WebSocket-based notifications, and geospatial queries.

## Architecture Overview

### Key Workflows

#### 1. Citizen SOS Creation
- Citizen creates SOS without authentication
- System automatically creates an Operation
- Operation appears in admin dashboard
- Admin assigns to nearest rescue team

#### 2. Rescue Team Assignment
- Admin selects rescue team and assigns SOS
- Team receives real-time notification
- Team can accept/reject mission
- After acceptance, team navigates to victim location
- Live location is streamed via WebSocket

#### 3. Mission Completion
- Rescue team marks mission status (on_the_way → reached → completed)
- Status updates sync between SOS and Operations collections
- On completion, SOS is deleted
- Operation marked as completed

## API Endpoints

### Authentication (No Auth Required for Citizens)

#### POST `/auth/rescue/register`
Register a rescue team member.
```json
{
  "full_name": "John Rescue",
  "mobile_number": "+9779841234567",
  "email": "john@rescue.np",
  "password": "SecurePass123!"
}
```
Response: Returns `user_id` and sends OTP to email.

#### POST `/auth/admin/register`
Register an admin user.
Same format as rescue team registration.

#### POST `/auth/verify-otp`
Verify registration OTP.
```json
{
  "email": "john@rescue.np",
  "otp": "123456",
  "purpose": "register"
}
```

#### POST `/auth/login`
Login for rescue teams and admins.
```json
{
  "identifier": "john@rescue.np",
  "password": "SecurePass123!"
}
```
Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "role": "rescue_team",
  "user_id": "507f1f77bcf86cd799439011",
  "full_name": "John Rescue",
  "email": "john@rescue.np"
}
```

### SOS & Operations

#### POST `/sos`
Create SOS alert (Citizens - No Auth Required).
```json
{
  "location": {
    "type": "Point",
    "coordinates": [85.3240, 27.7172]
  },
  "address": "Thamel, Kathmandu",
  "emergency_type": "flood",
  "mobile_no": "+9779841234567",
  "additional_details": "Family trapped in flooded building"
}
```
Response:
```json
{
  "message": "SOS created",
  "sos_id": "507f1f77bcf86cd799439011"
}
```

#### GET `/get-sos?limit=50`
Get all SOS alerts (limit: 50 per page).
Response: Array of SOS documents with locations.

#### GET `/operations?limit=50`
Get all operations.
Response: Array of operations with current status and assignments.

#### GET `/operations/{operation_id}`
Get specific operation details.

#### PATCH `/operations/{operation_id}/task-status`
Update operation task status. Used internally when task status changes.
```json
{
  "taskStatus": "on_the_way"
}
```

#### POST `/reports`
Create incident report with media.
```json
{
  "incident_type": "flood",
  "description": "Water level rising in area",
  "media": ["base64_image_1", "base64_image_2"],
  "voice_messages": ["base64_voice_1"],
  "mobile_no": "+9779841234567"
}
```

### Assignment & Mission Management

#### POST `/assign-operations`
Admin assigns SOS to rescue team (Admin Only).
```json
{
  "teamId": "507f1f77bcf86cd799439011",
  "operationId": "507f1f77bcf86cd799439012",
  "rescue_team_location": {
    "type": "Point",
    "coordinates": [85.3240, 27.7172]
  }
}
```
Response: Assignment document + Real-time notification sent to team.

#### POST `/missions/{operation_id}/action`
Rescue team takes action on mission (Auth Required - Rescue Team).
```json
{
  "action": "accept|reject|start|reached|completed"
}
```
Actions:
- `accept`: Accept the assigned mission
- `reject`: Reject and make available for other teams
- `start`: Start moving to location (taskStatus = on_the_way)
- `reached`: Reached victim location
- `completed`: Mission accomplished

#### GET `/missions?status=assigned`
Get missions for current rescue team (Auth Required).
Query params: `status` = assigned|accepted|in_progress|completed

### Geospatial & Discovery (Uber-like Feature)

#### POST `/geospatial/nearby-sos`
Find nearby SOS alerts for rescue team (Auth Required - Rescue Team).
```json
{
  "longitude": 85.3240,
  "latitude": 27.7172,
  "max_distance_km": 10,
  "limit": 20
}
```
Response: List of nearby unassigned SOS with distance.

#### POST `/geospatial/nearby-rescue-teams`
Find nearby rescue teams for SOS location (Admin Only).
```json
{
  "longitude": 85.3240,
  "latitude": 27.7172,
  "max_distance_km": 15,
  "limit": 10
}
```
Response: List of available teams with distance and distance from SOS.

#### GET `/rescue-teams/{team_id}/stats`
Get rescue team performance stats.
Response:
```json
{
  "rescue_team_id": "507f1f77bcf86cd799439011",
  "assigned": 5,
  "in_progress": 2,
  "pending": 1,
  "completed": 42,
  "total": 50
}
```

#### GET `/statistics/operational`
Get system-wide statistics (Admin Only).
Response:
```json
{
  "operations": {
    "not_assigned": 3,
    "assigned": 5,
    "completed": 42,
    "total": 50
  },
  "sos": {
    "not_assigned": 3,
    "assigned": 5,
    "total": 8
  },
  "rescue_teams": {
    "active": 15,
    "total": 20
  }
}
```

### Dashboard APIs (Admin Only)

#### GET `/dashboard/operations?status=active&limit=100`
Get all operations for dashboard.
Query params:
- `status`: active|completed|all
- `limit`: 1-500

Response includes SOS details and team info for each operation.

#### GET `/dashboard/sos-alerts?limit=100`
Get all active SOS alerts.

#### GET `/dashboard/rescue-teams?limit=100`
Get all rescue teams with live locations and status.

#### GET `/dashboard/summary`
Get dashboard summary statistics.

#### GET `/dashboard/live-map-data`
Get all data for live map (SOS, teams, operations).
Most efficient for initial dashboard load.

## WebSocket Endpoints

### Real-Time Location Streaming (Rescue Teams)

**Endpoint:** `ws://localhost:8000/ws/rescue-team-location?token=JWT_TOKEN`

**Auth:** Requires valid JWT token for rescue team.

**Payload (Sending):**
```json
{
  "current_location": {
    "type": "Point",
    "coordinates": [85.3240, 27.7172]
  },
  "accuracy": 10.5,
  "heading": 120.5
}
```
Update frequency: Every 5-10 seconds while moving.

**Broadcast (Receiving):**
```json
{
  "type": "location_update",
  "rescue_team_id": "507f1f77bcf86cd799439011",
  "location": {
    "type": "Point",
    "coordinates": [85.3240, 27.7172]
  },
  "accuracy": 10.5,
  "heading": 120.5
}
```
Broadcast to all connected admin dashboards.

### Real-Time Notifications (Rescue Teams)

**Endpoint:** `ws://localhost:8000/ws/notifications?token=JWT_TOKEN`

**Auth:** Requires valid JWT token.

**Receiving Notifications:**

1. **SOS Assignment:**
```json
{
  "type": "sos_assignment",
  "timestamp": "2026-06-10T17:47:24Z",
  "operation_id": "507f1f77bcf86cd799439011",
  "sos_id": "507f1f77bcf86cd799439012",
  "sos_location": {
    "type": "Point",
    "coordinates": [85.3240, 27.7172]
  },
  "address": "Thamel, Kathmandu",
  "emergency_type": "flood",
  "priority": "high",
  "victim_mobile": "+9779841234567",
  "additional_details": "Family trapped",
  "action_required": "accept_or_reject"
}
```

2. **Status Update:**
```json
{
  "type": "status_update",
  "timestamp": "2026-06-10T17:47:24Z",
  "operation_id": "507f1f77bcf86cd799439011",
  "old_status": "assigned",
  "new_status": "on_the_way"
}
```

3. **Operation Completed:**
```json
{
  "type": "operation_completed",
  "timestamp": "2026-06-10T17:47:24Z",
  "operation_id": "507f1f77bcf86cd799439011",
  "sos_id": "507f1f77bcf86cd799439012"
}
```

4. **Emergency Alert (Broadcast):**
```json
{
  "type": "emergency_alert",
  "timestamp": "2026-06-10T17:47:24Z",
  "alert_type": "widespread_flood",
  "message": "Major flood alert in Kathmandu Valley",
  "location": {...}
}
```

**Sending Keep-Alive:**
```json
{
  "type": "ping"
}
```

**Receiving Pong:**
```json
{
  "type": "pong"
}
```

### Admin Dashboard Real-Time Updates

**Endpoint:** `ws://localhost:8000/ws/admin-dashboard?token=JWT_TOKEN`

**Auth:** Requires admin JWT token.

**Receiving Broadcasts:**

1. **Operation Update:**
```json
{
  "type": "operation_update",
  "operation": {...}
}
```

2. **SOS Alert:**
```json
{
  "type": "sos_alert",
  "sos": {...}
}
```

3. **Team Location Update:**
```json
{
  "type": "team_location_update",
  "team_id": "507f1f77bcf86cd799439011",
  "location": {
    "type": "Point",
    "coordinates": [85.3240, 27.7172]
  }
}
```

4. **Statistics Update:**
```json
{
  "type": "statistics_update",
  "statistics": {...}
}
```

**Requesting Snapshot:**
```json
{
  "type": "request_snapshot"
}
```

**Response:**
```json
{
  "type": "snapshot",
  "operations": [...],
  "rescue_teams": [...]
}
```

## Data Models

### SOS Collection
```json
{
  "_id": ObjectId,
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "address": string,
  "emergency_type": string,
  "priority": string,
  "mobile_no": string,
  "additional_details": string,
  "status": "not_assign|assigned|completed",
  "created_at": datetime,
  "updated_at": datetime
}
```

### Operations Collection
```json
{
  "_id": ObjectId,
  "operation_id": string,
  "sos_id": ObjectId,
  "assignId": ObjectId|null,
  "sos_location": GeoJSON,
  "rescue_team_location": GeoJSON|null,
  "status": "not_assign|assigned|completed",
  "taskStatus": "not_assign|assigned|on_the_way|reached|rescue_started|victim_safe|returning|completed",
  "created_at": datetime,
  "updated_at": datetime
}
```

### Rescue Team Location Collection
```json
{
  "_id": ObjectId,
  "rescue_team_id": string,
  "current_location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "accuracy": float|null,
  "heading": float|null,
  "updated_at": datetime
}
```

## Status Transitions

### Operation Status Flow
```
not_assign → assigned → completed
```

### Task Status Flow
```
not_assign → assigned → accepted → on_the_way → reached → rescue_started → victim_safe → returning → completed

(Alternative: assigned → rejected → not_assign)
```

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error description"
}
```

**Common Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `409`: Conflict (duplicate user)
- `500`: Server error

## Example Workflows

### Complete Rescue Workflow

1. **Citizen Creates SOS:**
   ```bash
   curl -X POST http://localhost:8000/sos \
     -H "Content-Type: application/json" \
     -d '{
       "location": {"type": "Point", "coordinates": [85.32, 27.72]},
       "address": "Thamel",
       "emergency_type": "flood",
       "mobile_no": "+977984123456",
       "additional_details": "Family trapped"
     }'
   ```

2. **Admin Views SOS:**
   ```bash
   curl http://localhost:8000/get-sos
   ```

3. **Admin Assigns to Team:**
   ```bash
   curl -X POST http://localhost:8000/assign-operations \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "teamId": "507f1f77bcf86cd799439011",
       "operationId": "507f1f77bcf86cd799439012",
       "rescue_team_location": {"type": "Point", "coordinates": [85.33, 27.71]}
     }'
   ```

4. **Team Connects to Notifications:**
   Team connects to `ws://localhost:8000/ws/notifications?token=TEAM_JWT` and receives assignment.

5. **Team Accepts Mission:**
   ```bash
   curl -X POST http://localhost:8000/missions/507f1f77bcf86cd799439011/action \
     -H "Authorization: Bearer TEAM_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"action": "accept"}'
   ```

6. **Team Streams Location:**
   Team connects to `ws://localhost:8000/ws/rescue-team-location?token=TEAM_JWT` and sends location updates every 10 seconds.

7. **Team Updates Mission Status:**
   ```bash
   curl -X POST http://localhost:8000/missions/507f1f77bcf86cd799439011/action \
     -H "Authorization: Bearer TEAM_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"action": "started"}'
   ```

8. **Team Marks Complete:**
   ```bash
   curl -X POST http://localhost:8000/missions/507f1f77bcf86cd799439011/action \
     -H "Authorization: Bearer TEAM_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"action": "completed"}'
   ```

## Environment Variables

```env
# Server
HOST=0.0.0.0
PORT=8000

# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=hack4safety

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OTP
OTP_TTL_MINUTES=10
```

## Installation & Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python run.py
# Or: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database Initialization

MongoDB collections are auto-created on first use with proper indexes for:
- Geospatial queries (2dsphere)
- Creation time sorting
- Status filtering
