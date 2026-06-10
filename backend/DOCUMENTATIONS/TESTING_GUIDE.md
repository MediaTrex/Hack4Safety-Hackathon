# SAJAG AI Backend - Quick Start & Testing Guide

## Prerequisites

- Python 3.9+
- MongoDB (local or cloud)
- pip

## Installation

### 1. Setup Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Create `.env` file in `backend/` directory:
```env
# Server
HOST=0.0.0.0
PORT=8000

# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=hack4safety

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (SMTP) - Optional for testing
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OTP
OTP_TTL_MINUTES=10

# GIS Thresholds
DENSITY_LOW=30
DENSITY_MEDIUM=60
DENSITY_HIGH=85

# API
API_KEY=hack4safety_ai_engine_secret_2026
```

### 4. Start MongoDB
```bash
# If MongoDB is running locally
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

## Running the Backend

### Development Mode (with auto-reload)
```bash
python run.py
# Or manually:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Testing Workflows

### 1. Test Citizen SOS Creation

```bash
# Create SOS
curl -X POST http://localhost:8000/sos \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "type": "Point",
      "coordinates": [85.3240, 27.7172]
    },
    "address": "Thamel, Kathmandu",
    "emergency_type": "flood",
    "mobile_no": "+9779841234567",
    "additional_details": "Family trapped in flooded building"
  }'

# Response:
# {
#   "message": "SOS created",
#   "sos_id": "507f1f77bcf86cd799439011"
# }
```

### 2. Register & Login Rescue Team

```bash
# Register
curl -X POST http://localhost:8000/auth/rescue/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Rescue",
    "mobile_number": "+9779841234567",
    "email": "john@rescue.np",
    "password": "SecurePass123!"
  }'

# Response includes user_id and OTP sent to email
# For testing, check MongoDB: db.otp_requests.findOne({email: "john@rescue.np"})

# Verify OTP (use OTP from DB or check email)
curl -X POST http://localhost:8000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@rescue.np",
    "otp": "123456",
    "purpose": "register"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@rescue.np",
    "password": "SecurePass123!"
  }'

# Response:
# {
#   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
#   "role": "rescue_team",
#   "user_id": "507f1f77bcf86cd799439011",
#   "full_name": "John Rescue",
#   "email": "john@rescue.np"
# }
```

### 3. Admin Assignment

```bash
# First register admin (same process as rescue team)
# Then login to get ADMIN_TOKEN

# View SOS alerts
curl -X GET http://localhost:8000/get-sos
curl -X GET http://localhost:8000/operations

# Assign SOS to rescue team
# (Use team_id from registration and operation_id from SOS)
curl -X POST http://localhost:8000/assign-operations \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "TEAM_ID_HERE",
    "operationId": "OPERATION_ID_HERE",
    "rescue_team_location": {
      "type": "Point",
      "coordinates": [85.3300, 27.7100]
    }
  }'
```

### 4. Rescue Team Workflow

```bash
# Connect to notifications WebSocket in terminal
# (Install wscat: npm install -g wscat)
wscat -c "ws://localhost:8000/ws/notifications?token=TEAM_JWT_TOKEN"

# In another terminal, send location updates
wscat -c "ws://localhost:8000/ws/rescue-team-location?token=TEAM_JWT_TOKEN"

# Send location update (in WebSocket)
{
  "current_location": {
    "type": "Point",
    "coordinates": [85.3250, 27.7180]
  },
  "accuracy": 10.5,
  "heading": 45.0
}

# Accept mission (REST API)
curl -X POST http://localhost:8000/missions/OPERATION_ID/action \
  -H "Authorization: Bearer TEAM_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "accept"}'

# Start mission
curl -X POST http://localhost:8000/missions/OPERATION_ID/action \
  -H "Authorization: Bearer TEAM_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# Reached location
curl -X POST http://localhost:8000/missions/OPERATION_ID/action \
  -H "Authorization: Bearer TEAM_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "reached"}'

# Mark completed
curl -X POST http://localhost:8000/missions/OPERATION_ID/action \
  -H "Authorization: Bearer TEAM_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "completed"}'
```

### 5. Geospatial Queries

```bash
# Find nearby SOS for rescue team
curl -X POST http://localhost:8000/geospatial/nearby-sos \
  -H "Authorization: Bearer TEAM_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": 85.3240,
    "latitude": 27.7172,
    "max_distance_km": 10,
    "limit": 20
  }'

# Find nearby rescue teams (Admin only)
curl -X POST http://localhost:8000/geospatial/nearby-rescue-teams \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": 85.3240,
    "latitude": 27.7172,
    "max_distance_km": 15,
    "limit": 10
  }'

# Get team statistics
curl -X GET http://localhost:8000/rescue-teams/TEAM_ID/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN or RESCUE"

# Get operational statistics
curl -X GET http://localhost:8000/statistics/operational \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 6. Admin Dashboard

```bash
# Get dashboard operations
curl -X GET "http://localhost:8000/dashboard/operations?status=active&limit=100" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get SOS alerts
curl -X GET "http://localhost:8000/dashboard/sos-alerts?limit=100" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get rescue teams
curl -X GET "http://localhost:8000/dashboard/rescue-teams?limit=100" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get dashboard summary
curl -X GET http://localhost:8000/dashboard/summary \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get live map data
curl -X GET http://localhost:8000/dashboard/live-map-data \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Connect to admin dashboard WebSocket
wscat -c "ws://localhost:8000/ws/admin-dashboard?token=ADMIN_JWT_TOKEN"

# Request snapshot
{
  "type": "request_snapshot"
}
```

## MongoDB Database

### Collections Created Automatically

1. **sos** - SOS alerts
   - Indexes: location (2dsphere), created_at
   
2. **operations** - Operations tracking
   - Indexes: sos_location (2dsphere), status, taskStatus
   
3. **rescue_team_location** - Live team locations
   - Indexes: current_location (2dsphere)
   
4. **users** - Rescue teams and admins
   
5. **reports** - Incident reports
   
6. **otp_requests** - OTP verification
   
7. **assign_operations** - Assignment tracking

### Useful MongoDB Queries

```javascript
// Connect to MongoDB
mongo

// Use database
use hack4safety

// View SOS alerts
db.sos.find().pretty()

// View active operations
db.operations.find({status: {$ne: "completed"}}).pretty()

// View rescue team locations
db.rescue_team_location.find().pretty()

// Get team stats
db.operations.aggregate([
  {$match: {assignId: ObjectId("TEAM_ID")}},
  {$group: {
    _id: "$taskStatus",
    count: {$sum: 1}
  }}
])

// Get operations assigned in last hour
db.operations.find({
  updated_at: {
    $gte: new Date(Date.now() - 3600000)
  }
}).pretty()
```

## Debugging

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running: `mongo` or `mongosh`
   - Verify MONGODB_URL in .env
   - Check MongoDB port (default: 27017)

2. **JWT Token Expired**
   - Tokens expire after ACCESS_TOKEN_EXPIRE_MINUTES
   - Login again to get new token
   - Check token expiry: `jwt.decode(token, secret_key, algorithms=["HS256"])`

3. **WebSocket Connection Failed**
   - Ensure token is valid
   - Check browser console for errors
   - Verify WebSocket endpoint URL

4. **Geospatial Queries Not Working**
   - Ensure 2dsphere indexes are created (auto-created on first use)
   - Coordinates must be [longitude, latitude]
   - Verify coordinates are within valid ranges

### Logs

Check application logs:
- Terminal where server is running
- MongoDB logs (if enabled)
- Browser console for frontend errors

## Performance Optimization

1. **Pagination**: Use limit parameter (default 50-100)
2. **Indexes**: Auto-created for geospatial and frequently queried fields
3. **Caching**: Consider Redis for frequently accessed data
4. **Connection Pooling**: Configured automatically by motor (MongoDB driver)

## Production Deployment

1. Use strong SECRET_KEY
2. Set COOKIE_SECURE=true (HTTPS only)
3. Configure CORS origins properly
4. Use environment secrets for credentials
5. Enable MongoDB authentication
6. Use Docker for deployment
7. Configure rate limiting
8. Enable logging and monitoring
9. Use Nginx as reverse proxy
10. Set up CI/CD pipeline

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    SAJAG AI Backend                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │   REST APIs      │  │     WebSocket Endpoints         │ │
│  ├──────────────────┤  ├──────────────────────────────────┤ │
│  │ • SOS Creation   │  │ • /ws/notifications              │ │
│  │ • Operations     │  │ • /ws/rescue-team-location      │ │
│  │ • Assignment     │  │ • /ws/admin-dashboard           │ │
│  │ • Mission Mgmt   │  │                                  │ │
│  │ • Geospatial     │  └──────────────────────────────────┘ │
│  │ • Dashboard      │                                       │
│  └──────────────────┘                                       │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ Services Layer   │  │   Notification Manager           │ │
│  ├──────────────────┤  ├──────────────────────────────────┤ │
│  │ • Auth           │  │ • Queue notifications            │ │
│  │ • SOS/Operations │  │ • Broadcast to teams             │ │
│  │ • Geospatial     │  │ • Real-time updates              │ │
│  │ • Location       │  │                                  │ │
│  │ • Notifications  │  └──────────────────────────────────┘ │
│  └──────────────────┘                                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          MongoDB Database                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │ Collections │  │ Geospatial   │  │ Indexes   │  │   │
│  │  │ • sos       │  │ 2dsphere     │  │ TTL       │  │   │
│  │  │ • operations│  │ for location │  │ auto-inc  │  │   │
│  │  │ • users     │  │ queries      │  │           │  │   │
│  │  │ • ...       │  │              │  │           │  │   │
│  │  └─────────────┘  └──────────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
backend/
├── app/
│   ├── config/
│   │   ├── database.py         # MongoDB connection
│   │   ├── security.py         # JWT & Password hashing
│   │   └── settings.py         # Configuration
│   ├── middleware/
│   │   └── auth.py             # Auth middleware
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── sos_report_operation_routes.py
│   │   ├── assign_operations_routes.py
│   │   ├── rescue_team_location_ws_routes.py
│   │   ├── geospatial_routes.py
│   │   ├── notifications_ws_routes.py
│   │   ├── admin_dashboard_ws_routes.py
│   │   ├── dashboard_routes.py
│   │   └── mission_routes.py
│   ├── schemas/
│   │   └── [pydantic models]
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── sos_report_operation_service.py
│   │   ├── assign_operations_service.py
│   │   ├── rescue_team_location_service.py
│   │   ├── geospatial_service.py
│   │   ├── notification_service.py
│   │   └── email_service.py
│   ├── utils/
│   │   └── generate_operation_id.py
│   ├── uploads/
│   ├── main.py                 # FastAPI app
│   └── __init__.py
├── run.py                      # Entry point
├── requirements.txt            # Dependencies
├── .env                        # Environment config
├── .env.example
├── README.md
├── API_DOCUMENTATION.md
└── TESTING_GUIDE.md
```

