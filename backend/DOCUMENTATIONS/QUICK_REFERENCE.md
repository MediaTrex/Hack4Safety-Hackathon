# SAJAG AI Backend - Quick Reference Card

## Quick Start
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
export MONGODB_URL=mongodb://localhost:27017
python run.py
# Access: http://localhost:8000/docs
```

## API Endpoints at a Glance

### No Auth (Citizens)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/sos` | Create SOS alert |
| GET | `/get-sos` | List SOS alerts |
| POST | `/reports` | Create incident report |

### Rescue Team (JWT)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/rescue/register` | Register team |
| POST | `/auth/login` | Login |
| GET | `/missions` | Get assigned missions |
| POST | `/missions/{id}/action` | Accept/start/complete mission |
| POST | `/geospatial/nearby-sos` | Find nearby SOS |

### Admin (JWT)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/admin/register` | Register admin |
| POST | `/auth/login` | Login |
| POST | `/assign-operations` | Assign SOS to team |
| GET | `/dashboard/operations` | View operations |
| GET | `/dashboard/rescue-teams` | View teams |
| GET | `/dashboard/sos-alerts` | View alerts |
| GET | `/dashboard/live-map-data` | Map data |
| GET | `/dashboard/summary` | Statistics |
| POST | `/geospatial/nearby-rescue-teams` | Find nearby teams |
| GET | `/rescue-teams/{id}/stats` | Team stats |
| GET | `/statistics/operational` | System stats |

## 🔌 WebSocket Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `ws://localhost:8000/ws/notifications?token=JWT` | Required | Team notifications |
| `ws://localhost:8000/ws/rescue-team-location?token=JWT` | Required | Location streaming |
| `ws://localhost:8000/ws/admin-dashboard?token=JWT` | Required | Admin live updates |

## 📊 Mission Status Flow

```
Assignment → Accept/Reject
              ↓
            Accept
              ↓
          On The Way
              ↓
            Reached
              ↓
      Rescue Started
              ↓
         Completed
```

## 🗺️ Geospatial Features

### Find Nearby SOS (for teams)
```bash
curl -X POST http://localhost:8000/geospatial/nearby-sos \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "longitude": 85.32,
    "latitude": 27.72,
    "max_distance_km": 10,
    "limit": 20
  }'
```

### Find Nearby Teams (for admins)
```bash
curl -X POST http://localhost:8000/geospatial/nearby-rescue-teams \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "longitude": 85.32,
    "latitude": 27.72,
    "max_distance_km": 15,
    "limit": 10
  }'
```

## 📋 Mission Actions

```bash
# Accept mission
curl -X POST http://localhost:8000/missions/{id}/action \
  -H "Authorization: Bearer TOKEN" \
  -d '{"action": "accept"}'

# Start heading to location
curl -X POST http://localhost:8000/missions/{id}/action \
  -H "Authorization: Bearer TOKEN" \
  -d '{"action": "start"}'

# Mark as reached
curl -X POST http://localhost:8000/missions/{id}/action \
  -H "Authorization: Bearer TOKEN" \
  -d '{"action": "reached"}'

# Mark as completed
curl -X POST http://localhost:8000/missions/{id}/action \
  -H "Authorization: Bearer TOKEN" \
  -d '{"action": "completed"}'
```

## 🔐 Environment Variables

```env
# Required
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=hack4safety
SECRET_KEY=your-secret-key

# Optional (with defaults)
HOST=0.0.0.0
PORT=8000
ACCESS_TOKEN_EXPIRE_MINUTES=60
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📦 New Features Summary

| Feature | File | Endpoints |
|---------|------|-----------|
| Geospatial Queries | `geospatial_service.py` | `/geospatial/*` |
| Real-Time Notifications | `notification_service.py` | `ws://notifications` |
| Admin Dashboard WS | `admin_dashboard_ws_routes.py` | `ws://admin-dashboard` |
| Dashboard REST APIs | `dashboard_routes.py` | `/dashboard/*` |
| Mission Management | `mission_routes.py` | `/missions/*` |

## 🐛 Common Errors & Solutions

| Error | Solution |
|-------|----------|
| `MongoDB connection error` | Start MongoDB: `mongod` |
| `JWT token invalid` | Login again to get new token |
| `WebSocket connection failed` | Check token in query params |
| `Geospatial query slow` | Indexes auto-created on first use |
| `SOS not found after assignment` | Refresh - SOS deleted on completion |

## 🧪 Testing Commands

```bash
# Create SOS (no auth)
curl -X POST http://localhost:8000/sos -d '...'

# Register team
curl -X POST http://localhost:8000/auth/rescue/register -d '...'

# Verify OTP
curl -X POST http://localhost:8000/auth/verify-otp -d '...'

# Login
curl -X POST http://localhost:8000/auth/login -d '...'

# Get token from login response and use as:
# curl ... -H "Authorization: Bearer <TOKEN>"

# For WebSocket (install wscat: npm install -g wscat)
wscat -c "ws://localhost:8000/ws/notifications?token=<TOKEN>"
```

## 📈 Performance Tips

- **Pagination**: Always use `limit` parameter (default 50-100)
- **Geospatial**: Keep radius ≤ 50km for fast queries
- **WebSocket**: Update location every 5-10 seconds
- **Dashboard**: Use `live-map-data` endpoint for initial load
- **Indexes**: Auto-created, but verify in MongoDB: `db.sos.getIndexes()`

## 🎯 Data Flow (Complete Workflow)

1. **Citizen** → Creates SOS via `POST /sos` (no auth)
2. **System** → Auto-creates Operation
3. **Admin** → Finds nearby teams via `POST /geospatial/nearby-rescue-teams`
4. **Admin** → Assigns SOS via `POST /assign-operations`
5. **System** → Sends WebSocket notification to team
6. **Team** → Receives notification via `ws://notifications`
7. **Team** → Accepts mission via `POST /missions/{id}/action?action=accept`
8. **Team** → Streams location via `ws://rescue-team-location`
9. **Admin** → Sees live location on dashboard via `ws://admin-dashboard`
10. **Team** → Updates status (start → reached → completed)
11. **System** → Syncs status to SOS and Operations
12. **System** → On completion, deletes SOS

## 📚 Documentation Files

- **API_DOCUMENTATION.md** - Full API reference (500+ lines)
- **TESTING_GUIDE.md** - Testing workflows and setup (400+ lines)
- **README.md** - System overview and architecture (300+ lines)
- **IMPLEMENTATION_SUMMARY.md** - Changes and improvements (400+ lines)
- **Quick_Reference.md** - This file

## 🔗 Useful Links

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **MongoDB Shell**: `mongo` or `mongosh`
- **Python REPL**: `python`

## 💡 Pro Tips

1. **Test with Swagger**: Visit http://localhost:8000/docs for interactive testing
2. **Monitor MongoDB**: `db.operations.find().limit(5)` in MongoDB shell
3. **Track WebSocket**: Browser DevTools → Network → WS tab
4. **Check Indexes**: `db.sos.getIndexes()` ensures geospatial index exists
5. **Trace Errors**: Check application logs in terminal output

## ⚡ Startup Sequence

```
1. Run: python run.py
2. Wait for: "[OK] Connected to MongoDB"
3. MongoDB collections auto-created
4. 2dsphere indexes auto-created
5. Server ready at http://localhost:8000
6. Swagger available at http://localhost:8000/docs
```

## 🎓 Learning Resources

### For Understanding the System
1. Read: **README.md** (5 min)
2. Read: **API_DOCUMENTATION.md** (10 min)
3. Run: **TESTING_GUIDE.md** workflows (30 min)
4. Explore: Swagger UI at `/docs` (5 min)

### For Integration
1. Check: Relevant endpoint in **API_DOCUMENTATION.md**
2. Copy: Example curl command from **TESTING_GUIDE.md**
3. Test: In Swagger or with curl
4. Implement: In your app

### For Troubleshooting
1. Check: Error code meanings in **API_DOCUMENTATION.md**
2. Run: Relevant test in **TESTING_GUIDE.md**
3. Verify: MongoDB collections exist
4. Check: Application logs in terminal

---

**Quick Links:**
- 🐞 **Report Bug**: Check logs and MongoDB
- ❓ **Ask Question**: Check API_DOCUMENTATION.md
- 🚀 **Deploy**: See README.md production section
- 🧪 **Test**: See TESTING_GUIDE.md
- 📖 **Learn**: See README.md architecture section

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: June 2026
