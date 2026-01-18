# 📱 Instagram-Style Social App - Complete API Testing Guide

**Server URL:** `http://localhost:3006`

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. User Registration (Send OTP)
**Endpoint:** `POST /api/users/auth/register`

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "phonenumber": "+1234567890"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "email": "john@example.com"
}
```

**Error Responses:**
- `400`: "User already exists with this email or username"
- `400`: "OTP already sent to this email. Please check your email or wait for it to expire."
- `500`: "Failed to send OTP email. Please try again."

---

### 2. OTP Verification (Create Account + Auto Login)
**Endpoint:** `POST /api/users/auth/verify-otp`

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (201):**
```json
{
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userid": "user_1234567890",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "redirectUrl": "/johndoe/profile"
}
```

**Error Responses:**
- `400`: "Invalid OTP or email"
- `400`: "OTP has expired. Please request a new one."

---

### 3. User Login
**Endpoint:** `POST /api/users/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: "Invalid email or password"

---

## 👤 PROFILE ENDPOINTS

### 4. Get User Profile (with Posts)
**Endpoint:** `GET /:username/profile`

**Headers (Optional for visitors, Required for own profile):**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example:** `GET /johndoe/profile`

**Success Response (Own Profile):**
```json
{
  "isOwnProfile": true,
  "canEdit": true,
  "userMatched": true,
  "profile": {
    "userid": "user_1234567890",
    "username": "johndoe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "isAdmin": false,
    "isActive": true,
    "createdAt": "2024-01-13T10:00:00.000Z",
    "updatedAt": "2024-01-13T10:00:00.000Z"
  },
  "profileData": {
    "displayPicture": null,
    "name": null,
    "profession": null,
    "dateOfBirth": null,
    "status": null,
    "socialMediaLinks": [],
    "followingCount": 0,
    "followersCount": 0,
    "isProfileComplete": false
  },
  "posts": []
}
```

**Success Response (Other User's Profile - Visitor):**
```json
{
  "isOwnProfile": false,
  "canEdit": false,
  "userMatched": false,
  "message": "Viewing as visitor - limited details",
  "profile": {
    "username": "johndoe",
    "isActive": true,
    "createdAt": "2024-01-13T10:00:00.000Z"
  },
  "profileData": {
    "displayPicture": "https://example.com/dp.jpg",
    "name": "John Doe",
    "profession": "Developer",
    "status": "Building cool apps!",
    "followingCount": 5,
    "followersCount": 10
  },
  "posts": [
    {
      "_id": "post_id_here",
      "userid": "user_1234567890",
      "username": "johndoe",
      "textmsg": "Hello world! My first post 🚀",
      "likes": { "count": 3, "users": ["user_111", "user_222", "user_333"] },
      "shares": { "count": 1, "users": ["user_444"] },
      "commentsCount": 2,
      "comments": [
        {
          "userid": "user_555",
          "username": "janedoe",
          "comment": "Great post!",
          "createdAt": "2024-01-13T10:05:00.000Z"
        }
      ],
      "createdAt": "2024-01-13T10:00:00.000Z",
      "updatedAt": "2024-01-13T10:05:00.000Z"
    }
  ]
}
```

---

### 5. Update Profile Data
**Endpoint:** `PUT /api/users/profile-data`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "displayPicture": "https://example.com/profile-pic.jpg",
  "name": "John Doe",
  "profession": "Full Stack Developer",
  "dateOfBirth": "1990-05-15",
  "status": "Building amazing web applications! 🚀",
  "socialMediaLinks": [
    {
      "platform": "github",
      "url": "https://github.com/johndoe",
      "username": "johndoe"
    },
    {
      "platform": "linkedin",
      "url": "https://linkedin.com/in/johndoe",
      "username": "johndoe"
    },
    {
      "platform": "twitter",
      "url": "https://twitter.com/johndoe",
      "username": "johndoe"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profileData": {
    "displayPicture": "https://example.com/profile-pic.jpg",
    "name": "John Doe",
    "profession": "Full Stack Developer",
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "status": "Building amazing web applications! 🚀",
    "socialMediaLinks": [
      {
        "platform": "github",
        "url": "https://github.com/johndoe",
        "username": "johndoe"
      },
      {
        "platform": "linkedin",
        "url": "https://linkedin.com/in/johndoe",
        "username": "johndoe"
      },
      {
        "platform": "twitter",
        "url": "https://twitter.com/johndoe",
        "username": "johndoe"
      }
    ],
    "followingCount": 5,
    "followersCount": 10,
    "isProfileComplete": true,
    "updatedAt": "2024-01-13T10:10:00.000Z"
  }
}
```

---

## 📝 POST & FEED ENDPOINTS

### 6. Create Post
**Endpoint:** `POST /api/posts`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "textmsg": "Just launched my new React app! Check it out at https://myapp.com 🚀 #react #webdev"
}
```

**Success Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "post_id_here",
    "userid": "user_1234567890",
    "username": "johndoe",
    "textmsg": "Just launched my new React app! Check it out at https://myapp.com 🚀 #react #webdev",
    "likes": { "count": 0, "users": [] },
    "shares": { "count": 0, "users": [] },
    "comments": [],
    "createdAt": "2024-01-13T10:15:00.000Z"
  }
}
```

---

### 7. Get Feed (Instagram-style)
**Endpoint:** `GET /api/posts/feed`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "posts": [
    {
      "_id": "post_id_1",
      "userid": "user_followed_1",
      "username": "followeduser1",
      "textmsg": "Beautiful sunset today! 🌅",
      "likes": { "count": 15, "users": ["user_111", "user_222", ...] },
      "shares": { "count": 3, "users": ["user_333", "user_444", "user_555"] },
      "commentsCount": 8,
      "comments": [
        {
          "userid": "user_666",
          "username": "commenter1",
          "comment": "Stunning! 📸",
          "createdAt": "2024-01-13T10:20:00.000Z"
        }
      ],
      "createdAt": "2024-01-13T10:18:00.000Z",
      "updatedAt": "2024-01-13T10:20:00.000Z"
    },
    {
      "_id": "post_id_2",
      "userid": "user_followed_2",
      "username": "followeduser2",
      "textmsg": "Working on something exciting! Can't wait to share more details soon 🤫",
      "likes": { "count": 7, "users": ["user_777", "user_888", ...] },
      "shares": { "count": 1, "users": ["user_999"] },
      "commentsCount": 3,
      "comments": [
        {
          "userid": "user_101",
          "username": "commenter2",
          "comment": "Tease! Can't wait! 😄",
          "createdAt": "2024-01-13T10:25:00.000Z"
        }
      ],
      "createdAt": "2024-01-13T10:22:00.000Z",
      "updatedAt": "2024-01-13T10:25:00.000Z"
    }
  ]
}
```

---

### 8. Get User's Posts
**Endpoint:** `GET /:username/posts`

**Example:** `GET /johndoe/posts`

**Success Response (200):**
```json
{
  "user": {
    "userid": "user_1234567890",
    "username": "johndoe"
  },
  "posts": [
    {
      "_id": "post_id_here",
      "userid": "user_1234567890",
      "username": "johndoe",
      "textmsg": "Just launched my new React app! Check it out at https://myapp.com 🚀",
      "likes": { "count": 5, "users": ["user_111", "user_222", "user_333", "user_444", "user_555"] },
      "shares": { "count": 2, "users": ["user_666", "user_777"] },
      "commentsCount": 3,
      "comments": [
        {
          "userid": "user_888",
          "username": "commenter1",
          "comment": "Congrats! 🎉",
          "createdAt": "2024-01-13T10:16:00.000Z"
        },
        {
          "userid": "user_999",
          "username": "commenter2",
          "comment": "Looks amazing!",
          "createdAt": "2024-01-13T10:17:00.000Z"
        }
      ],
      "createdAt": "2024-01-13T10:15:00.000Z",
      "updatedAt": "2024-01-13T10:17:00.000Z"
    }
  ]
}
```

---

### 9. Like/Unlike Post
**Endpoint:** `PUT /api/posts/:postId/like`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example:** `PUT /api/posts/507f1f77bcf86cd799439011/like`

**Success Response (200):**
```json
{
  "message": "Post liked",
  "likes": {
    "count": 6,
    "users": ["user_111", "user_222", "user_333", "user_444", "user_555", "user_1234567890"]
  }
}
```

**If already liked (unlike):**
```json
{
  "message": "Post unliked",
  "likes": {
    "count": 5,
    "users": ["user_111", "user_222", "user_333", "user_444", "user_555"]
  }
}
```

---

### 10. Share Post
**Endpoint:** `PUT /api/posts/:postId/share`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example:** `PUT /api/posts/507f1f77bcf86cd799439011/share`

**Success Response (200):**
```json
{
  "message": "Post shared successfully",
  "shares": {
    "count": 3,
    "users": ["user_666", "user_777", "user_1234567890"]
  },
  "shareableLink": "http://localhost:3000/post/507f1f77bcf86cd799439011"
}
```

---

### 11. Add Comment to Post
**Endpoint:** `POST /api/posts/:postId/comment`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Example:** `POST /api/posts/507f1f77bcf86cd799439011/comment`

**Request:**
```json
{
  "comment": "This is an amazing post! Thanks for sharing your experience. 🙌"
}
```

**Success Response (201):**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "userid": "user_1234567890",
    "username": "johndoe",
    "comment": "This is an amazing post! Thanks for sharing your experience. 🙌",
    "createdAt": "2024-01-13T10:30:00.000Z"
  },
  "commentsCount": 4
}
```

---

### 12. Get Post Details (with all comments)
**Endpoint:** `GET /api/posts/:postId`

**Example:** `GET /api/posts/507f1f77bcf86cd799439011`

**Success Response (200):**
```json
{
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "userid": "user_1234567890",
    "username": "johndoe",
    "textmsg": "Just launched my new React app! Check it out at https://myapp.com 🚀",
    "likes": {
      "count": 8,
      "users": ["user_111", "user_222", "user_333", "user_444", "user_555", "user_666", "user_777", "user_888"]
    },
    "shares": {
      "count": 3,
      "users": ["user_999", "user_101", "user_102"]
    },
    "comments": [
      {
        "userid": "user_103",
        "username": "commenter1",
        "comment": "Congrats on the launch! 🎉",
        "createdAt": "2024-01-13T10:16:00.000Z"
      },
      {
        "userid": "user_104",
        "username": "commenter2",
        "comment": "The UI looks fantastic!",
        "createdAt": "2024-01-13T10:17:00.000Z"
      },
      {
        "userid": "user_105",
        "username": "commenter3",
        "comment": "How long did it take to build?",
        "createdAt": "2024-01-13T10:18:00.000Z"
      },
      {
        "userid": "user_1234567890",
        "username": "johndoe",
        "comment": "Thanks everyone! It took about 3 months of development. 🚀",
        "createdAt": "2024-01-13T10:19:00.000Z"
      }
    ],
    "createdAt": "2024-01-13T10:15:00.000Z",
    "updatedAt": "2024-01-13T10:19:00.000Z"
  }
}
```

---

### 13. Delete Post
**Endpoint:** `DELETE /api/posts/:postId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example:** `DELETE /api/posts/507f1f77bcf86cd799439011`

**Success Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

**Error Response (403):**
```json
{
  "message": "You can only delete your own posts"
}
```

---

## 🧪 COMPLETE TESTING SCENARIO

### **Phase 1: User Registration & Setup**

1. **Register User 1:**
   ```
   POST /api/users/auth/register
   {
     "username": "johndoe",
     "email": "john@example.com",
     "password": "password123",
     "phonenumber": "+1234567890"
   }
   ```
   → Check email for OTP

2. **Verify OTP for User 1:**
   ```
   POST /api/users/auth/verify-otp
   {
     "email": "john@example.com",
     "otp": "123456"
   }
   ```
   → Get JWT token, redirected to `/johndoe/profile`

3. **Update Profile for User 1:**
   ```
   PUT /api/users/profile-data
   Headers: Authorization: Bearer JWT_TOKEN
   {
     "name": "John Doe",
     "profession": "Developer",
     "status": "Building cool apps!",
     "displayPicture": "https://example.com/john.jpg"
   }
   ```

4. **Register User 2:**
   ```
   POST /api/users/auth/register
   {
     "username": "janedoe",
     "email": "jane@example.com",
     "password": "password456"
   }
   ```
   → Verify OTP, update profile

### **Phase 2: Posting & Social Interaction**

5. **User 1 creates posts:**
   ```
   POST /api/posts
   Headers: Authorization: Bearer USER1_JWT
   {
     "textmsg": "Just launched my portfolio website! Check it out 🚀"
   }
   ```

6. **User 2 creates posts:**
   ```
   POST /api/posts
   Headers: Authorization: Bearer USER2_JWT
   {
     "textmsg": "Beautiful morning for coding! ☕💻"
   }
   ```

### **Phase 3: Social Features Testing**

7. **User 1 likes User 2's post:**
   ```
   PUT /api/posts/USER2_POST_ID/like
   Headers: Authorization: Bearer USER1_JWT
   ```

8. **User 1 comments on User 2's post:**
   ```
   POST /api/posts/USER2_POST_ID/comment
   Headers: Authorization: Bearer USER1_JWT
   {
     "comment": "Love this! So inspiring! 💪"
   }
   ```

9. **User 2 shares User 1's post:**
   ```
   PUT /api/posts/USER1_POST_ID/share
   Headers: Authorization: Bearer USER2_JWT
   ```

### **Phase 4: Feed & Profile Viewing**

10. **Check User 1's feed (should see User 2's posts):**
    ```
    GET /api/posts/feed
    Headers: Authorization: Bearer USER1_JWT
    ```

11. **Check User 2's feed (should see User 1's posts):**
    ```
    GET /api/posts/feed
    Headers: Authorization: Bearer USER2_JWT
    ```

12. **View User 1's profile as User 2:**
    ```
    GET /johndoe/profile
    Headers: Authorization: Bearer USER2_JWT
    ```
    → Should show posts underneath profile

13. **View User 2's posts:**
    ```
    GET /janedoe/posts
    ```
    → Public access, shows all posts

### **Phase 5: Advanced Features**

14. **Get detailed post view:**
    ```
    GET /api/posts/POST_ID
    ```
    → Shows all comments

15. **Test duplicate likes (should prevent):**
    ```
    PUT /api/posts/POST_ID/like (twice)
    Headers: Authorization: Bearer USER1_JWT
    ```
    → First: liked, Second: unliked

---

## 📊 API STATUS SUMMARY

| Endpoint | Method | Auth Required | Status |
|----------|--------|---------------|---------|
| `/api/users/auth/register` | POST | ❌ | ✅ Working |
| `/api/users/auth/verify-otp` | POST | ❌ | ✅ Working |
| `/api/users/auth/login` | POST | ❌ | ✅ Working |
| `/:username/profile` | GET | ❌ (Optional) | ✅ Working |
| `/api/users/profile-data` | PUT | ✅ | ✅ Working |
| `/api/posts` | POST | ✅ | ✅ Working |
| `/api/posts/feed` | GET | ✅ | ✅ Working |
| `/:username/posts` | GET | ❌ | ✅ Working |
| `/api/posts/:postId/like` | PUT | ✅ | ✅ Working |
| `/api/posts/:postId/share` | PUT | ✅ | ✅ Working |
| `/api/posts/:postId/comment` | POST | ✅ | ✅ Working |
| `/api/posts/:postId` | GET | ❌ | ✅ Working |
| `/api/posts/:postId` | DELETE | ✅ | ✅ Working |

**Total Endpoints:** 13
**Working:** 13/13 ✅

---

## 🚀 QUICK START TESTING

1. **Set up `.env`** with email credentials
2. **Start server:** `npm start`
3. **Test registration** → OTP → Profile creation
4. **Create posts** → Like → Comment → Share
5. **Check feeds** → Visit profiles → View posts

**All endpoints are ready for testing!** 🎯