# Expo Push Notification Integration Guide

## Overview
This guide explains how to integrate **Expo Push Notifications** with the Hack4Safety mobile app (React Native + Expo) using the newly added FastAPI backend endpoints.

---
### Backend API Endpoints
| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| `POST` | `/notifications/register-token` | Register or update an Expo push token. | ❌ (none) |
| `DELETE` | `/notifications/unregister-token` | Remove a token. | ❌ (none) |
| `POST` | `/admin/notifications/broadcast` | Admin‑only broadcast to **all** registered devices. | ✅ (admin) |
| `POST` | `/admin/notifications/send-to-user/{user_id}` | Admin‑only push to a specific user. | ✅ (admin) |

All payloads use the JSON schemas defined in `backend/app/schemas/notification_schemas.py`.

---
## React Native (Expo) Setup
1. **Install dependencies**
   ```bash
   expo install expo-notifications expo-device
   ```
2. **Configure permissions** (iOS requires explicit permission request):
   ```tsx
   import * as Notifications from 'expo-notifications';
   import * as Device from 'expo-device';

   async function registerForPushNotificationsAsync() {
     let token;
     if (Device.isDevice) {
       const { status: existingStatus } = await Notifications.getPermissionsAsync();
       let finalStatus = existingStatus;
       if (existingStatus !== 'granted') {
         const { status } = await Notifications.requestPermissionsAsync();
         finalStatus = status;
       }
       if (finalStatus !== 'granted') {
         alert('Failed to get push token for push notifications!');
         return;
       }
       token = (await Notifications.getExpoPushTokenAsync()).data;
     } else {
       alert('Must use physical device for Push Notifications');
     }

     return token;
   }
   ```
3. **Register the token with the backend**
   ```tsx
   import axios from 'axios';
   import { getAuthToken } from '../utils/auth'; // your JWT helper

   async function registerExpoToken() {
     const expoToken = await registerForPushNotificationsAsync();
     if (!expoToken) return;

     const platform = Platform.OS; // 'ios' | 'android'
     await axios.post(
       `${API_BASE_URL}/notifications/register-token`,
       { expo_push_token: expoToken, platform },
       { headers: { Authorization: `Bearer ${await getAuthToken()}` } }
     );
   }
   ```
4. **Unregister on logout**
   ```tsx
   async function unregisterExpoToken(expoToken: string) {
     await axios.delete(`${API_BASE_URL}/notifications/unregister-token`, {
       data: { expo_push_token: expoToken },
       headers: { Authorization: `Bearer ${await getAuthToken()}` },
     });
   }
   ```
5. **Listen for incoming notifications**
   ```tsx
   useEffect(() => {
     const subscription = Notifications.addNotificationReceivedListener(notification => {
       // Handle foreground notification (e.g., update UI, show alert)
       console.log('Notification received:', notification);
     });

     const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
       // Handle interaction when user taps the notification
       console.log('Notification response:', response);
     });

     return () => {
       subscription.remove();
       responseSubscription.remove();
     };
   }, []);
   ```

---
## Admin Usage
- **Broadcast to all users** (e.g., system announcement):
  ```bash
  curl -X POST https://your-api.com/admin/notifications/broadcast \
    -H "Authorization: Bearer <ADMIN_JWT>" \
    -H "Content-Type: application/json" \
    -d '{"title":"Maintenance", "body":"The system will be down at 02:00 AM", "data":{"screen":"Maintenance"}}'
  ```
- **Send to a specific user** (replace `<user_id>`):
  ```bash
  curl -X POST https://your-api.com/admin/notifications/send-to-user/<user_id> \
    -H "Authorization: Bearer <ADMIN_JWT>" \
    -H "Content-Type: application/json" \
    -d '{"title":"Alert", "body":"Your SOS report has been accepted", "data":{"sos_id":123}}'
  ```

---
## Environment Variables (Backend)
| Variable | Description |
|----------|-------------|
| `EXPO_PUSH_URL` | Override Expo endpoint (default `https://exp.host/--/api/v2/push/send`). |
| `EXPO_BATCH_SIZE` | Batch size for sending (max 100). |
| `MONGODB_URL` / `DATABASE_NAME` | MongoDB connection details – used for the `expo_push_tokens` collection. |

---
## Testing
1. Run the FastAPI server (`uvicorn backend.app.main:app --reload`).
2. On a physical device, install the Expo app and run the React Native project.
3. Verify that the token is stored in MongoDB (`expo_push_tokens` collection).
4. Use the admin broadcast endpoint to send a test notification and confirm it appears on the device.

---
## Troubleshooting
- **DeviceNotRegistered** errors are automatically cleaned up by the background cleanup task (runs daily at 02:00 AM).
- Ensure the device has network access; Expo push service requires internet.
- On iOS, make sure the app’s **Entitlements** include push notifications and you have a valid Apple Push Notification key if you ever move away from Expo’s managed service.

---
**That’s it!** Your React Native Expo app can now receive push notifications sent from the FastAPI backend, both via admin‑initiated broadcasts and targeted messages.
