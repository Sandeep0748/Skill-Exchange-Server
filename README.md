# SkillLoop - Backend API

A RESTful API for the SkillLoop platform - a skill exchange and micro-service platform built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Skill Management**: Create, read, update, and delete skills
- **Skill Exchange Requests**: Request skills from other users and manage requests
- **User Profiles**: Manage user profile information
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with detailed error messages

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Validation**: express-validator
- **HTTP Logging**: Morgan

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── env.js         # Environment variables
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication logic
│   │   ├── skill.controller.js     # Skill management logic
│   │   └── request.controller.js   # Request management logic
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── error.middleware.js     # Global error handler
│   │   └── validate.middleware.js  # Validation result handler
│   ├── models/
│   │   ├── User.model.js           # User schema
│   │   ├── Skill.model.js          # Skill schema
│   │   └── Request.model.js        # Request schema
│   ├── routes/
│   │   ├── auth.routes.js          # Auth endpoints
│   │   ├── skill.routes.js         # Skill endpoints
│   │   └── request.routes.js       # Request endpoints
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore file
└── package.json          # Dependencies
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `MONGO_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT (change in production!)
   - `PORT`: Server port (default: 5000)

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "I love teaching coding",
  "phone": "9876543210"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Skill Endpoints

#### Create Skill
```http
POST /api/skills/
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "Programming",
  "title": "Python Basics",
  "description": "Learn Python programming fundamentals",
  "experienceLevel": "Beginner",
  "availability": {
    "days": ["Monday", "Wednesday", "Friday"],
    "timeSlots": ["10:00-12:00", "14:00-16:00"]
  }
}
```

#### Get All Skills
```http
GET /api/skills/?category=Programming&experienceLevel=Beginner
```

#### Get Skill by ID
```http
GET /api/skills/{skillId}
```

#### Get User's Skills
```http
GET /api/skills/user/{userId}
```

#### Search Skills
```http
GET /api/skills/search?query=python
```

#### Update Skill
```http
PUT /api/skills/{skillId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced Python",
  "description": "Updated description"
}
```

#### Delete Skill
```http
DELETE /api/skills/{skillId}
Authorization: Bearer <token>
```

### Request Endpoints

#### Create Request
```http
POST /api/requests/
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillId": "skill_id",
  "message": "I'm interested in learning this skill"
}
```

#### Get My Requests
```http
GET /api/requests/?type=sent&status=Pending
Authorization: Bearer <token>
```

Query Parameters:
- `type`: 'sent', 'received', or omit for both
- `status`: 'Pending', 'Accepted', 'Rejected', 'Completed'

#### Get Request by ID
```http
GET /api/requests/{requestId}
Authorization: Bearer <token>
```

#### Update Request Status
```http
PATCH /api/requests/{requestId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Accepted"
}
```

Valid statuses:
- `Accepted`: Skill owner accepts the request
- `Rejected`: Skill owner rejects the request
- `Completed`: Requester marks as completed (only for accepted requests)

#### Cancel Request
```http
DELETE /api/requests/{requestId}
Authorization: Bearer <token>
```

#### Get Requests for a Skill
```http
GET /api/requests/skill/{skillId}
Authorization: Bearer <token>
```

## Data Models

### User
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  phone: String (required, unique, 10-15 digits),
  password: String (required, min 6 chars, hashed),
  profileImage: String (optional),
  bio: String (optional, max 500 chars),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Skill
```javascript
{
  userId: ObjectId (reference to User),
  category: String (required),
  title: String (required),
  description: String (required),
  experienceLevel: String (enum: ["Beginner", "Intermediate", "Expert"]),
  availability: {
    days: [String],
    timeSlots: [String]
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Request
```javascript
{
  skillId: ObjectId (reference to Skill),
  fromUserId: ObjectId (reference to User),
  toUserId: ObjectId (reference to User),
  message: String (optional),
  status: String (enum: ["Pending", "Accepted", "Rejected", "Completed"], default: "Pending"),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Valid email required"
    }
  ]
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in and receives a token
2. Token is included in the `Authorization` header: `Bearer <token>`
3. Token is verified on protected routes
4. Token expires after 7 days (configurable via `JWT_EXPIRES_IN`)

## Development

### Running with hot-reload
```bash
npm run dev
```

### Debugging
Set `NODE_ENV=development` to get stack traces in error responses.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost:27017/skillloop |
| `JWT_SECRET` | Secret key for JWT signing | dev-key (change in production) |
| `JWT_EXPIRES_IN` | Token expiration time | 7d |

## Security Considerations

1. **Password Hashing**: Passwords are hashed using bcryptjs before storage
2. **JWT Tokens**: Use strong secrets in production
3. **Input Validation**: All inputs are validated using express-validator
4. **CORS**: Configure CORS for production environment
5. **MongoDB**: Use connection strings with authentication in production

## Future Enhancements

- Email notifications for request status changes
- User ratings and reviews
- Skill categories and advanced filtering
- Pagination for list endpoints
- File upload for profile pictures
- Admin dashboard
- Two-factor authentication
- Rate limiting
- Caching with Redis

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
