# MongoDB Atlas Data API Replacement

A drop-in replacement for the deprecated MongoDB Atlas Data API v1, built with TypeScript and designed for deployment on Google Cloud Functions.

## 🚨 Background

MongoDB Atlas Data API v1 is being deprecated and will be completely removed on **September 30, 2025**. This project provides a seamless replacement that maintains the same API interface and functionality.

## ✨ Features

- **Complete API Compatibility**: Drop-in replacement for all MongoDB Atlas Data API v1 endpoints
- **All CRUD Operations**: findOne, find, insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany, aggregate
- **Error Handling**: Comprehensive error responses matching original API format
- **TypeScript**: Fully typed with robust error handling
- **Serverless**: Optimized for Google Cloud Functions with connection pooling

## 🚀 Supported Operations

| Operation    | Endpoint                  | Description                                                 |
| ------------ | ------------------------- | ----------------------------------------------------------- |
| `findOne`    | `POST /action/findOne`    | Find a single document                                      |
| `find`       | `POST /action/find`       | Find multiple documents with filtering, sorting, pagination |
| `insertOne`  | `POST /action/insertOne`  | Insert a single document                                    |
| `insertMany` | `POST /action/insertMany` | Insert multiple documents                                   |
| `updateOne`  | `POST /action/updateOne`  | Update a single document                                    |
| `updateMany` | `POST /action/updateMany` | Update multiple documents                                   |
| `deleteOne`  | `POST /action/deleteOne`  | Delete a single document                                    |
| `deleteMany` | `POST /action/deleteMany` | Delete multiple documents                                   |
| `aggregate`  | `POST /action/aggregate`  | Run aggregation pipeline                                    |

## 🔧 Setup & Deployment

### 1. Prerequisites

- Google Cloud Project with Cloud Functions API enabled
- MongoDB Atlas cluster or MongoDB instance
- GitHub repository (this one!)

### 2. Environment Variables

Set these environment variables in Google Cloud Functions:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### 3. Deploy Options

#### Option A: Deploy from GitHub Repository (Recommended)

1. **Connect GitHub Repository**:

   - Go to Google Cloud Console → Cloud Functions
   - Create a new function
   - Select "Source Repository"
   - Connect this GitHub repository

2. **Configure Function**:

   - **Runtime**: Node.js 20
   - **Entry Point**: `handler`
   - **Memory**: 512 MB (recommended)
   - **Timeout**: 60 seconds
   - **Environment Variables**: Set `MONGODB_URI`

3. **Deploy**:
   - Click "Deploy"
   - Google Cloud will automatically build and deploy from your GitHub repo

#### Option B: Deploy with Docker

1. **Build the Docker image**:

   ```bash
   docker build -t mongo-data-api .
   ```

2. **Test locally**:

   ```bash
   docker run -p 8080:8080 \
     -e MONGODB_URI="your_mongodb_connection_string" \
     mongo-data-api
   ```

3. **Deploy to Google Cloud Run** (alternative to Cloud Functions):

   ```bash
   # Tag for Google Container Registry
   docker tag mongo-data-api gcr.io/YOUR_PROJECT_ID/mongo-data-api

   # Push to registry
   docker push gcr.io/YOUR_PROJECT_ID/mongo-data-api

   # Deploy to Cloud Run
   gcloud run deploy mongo-data-api \
     --image gcr.io/YOUR_PROJECT_ID/mongo-data-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars MONGODB_URI="your_connection_string"
   ```

## 📝 Usage Examples

### Find One Document

```bash
curl -X POST https://your-function-url/action/findOne \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataSource": "Cluster0",
    "database": "sample_db",
    "collection": "users",
    "filter": { "email": "john@example.com" }
  }'
```

### Find Multiple Documents

```bash
curl -X POST https://your-function-url/action/find \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataSource": "Cluster0",
    "database": "sample_db",
    "collection": "users",
    "filter": { "status": "active" },
    "sort": { "createdAt": -1 },
    "limit": 10
  }'
```

### Insert Document

```bash
curl -X POST https://your-function-url/action/insertOne \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataSource": "Cluster0",
    "database": "sample_db",
    "collection": "users",
    "document": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "status": "active"
    }
  }'
```

### Update Document

```bash
curl -X POST https://your-function-url/action/updateOne \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataSource": "Cluster0",
    "database": "sample_db",
    "collection": "users",
    "filter": { "email": "jane@example.com" },
    "update": { "$set": { "status": "inactive" } }
  }'
```

### Delete Document

```bash
curl -X POST https://your-function-url/action/deleteOne \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataSource": "Cluster0",
    "database": "sample_db",
    "collection": "users",
    "filter": { "email": "jane@example.com" }
  }'
```

### Aggregate Pipeline

```bash
curl -X POST https://your-function-url/action/aggregate \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataSource": "Cluster0",
    "database": "sample_db",
    "collection": "users",
    "pipeline": [
      { "$match": { "status": "active" } },
      { "$group": { "_id": "$department", "count": { "$sum": 1 } } }
    ]
  }'
```

## 📊 Response Format

All responses match the original MongoDB Atlas Data API format:

### Success Response

```json
{
  "document": { ... },        // for findOne
  "documents": [ ... ],       // for find, aggregate
  "insertedId": "...",        // for insertOne
  "insertedIds": [ ... ],     // for insertMany
  "matchedCount": 1,          // for updates
  "modifiedCount": 1,         // for updates
  "deletedCount": 1           // for deletes
}
```

### Error Response

```json
{
  "error": "Error description",
  "error_code": "ERROR_CODE"
}
```

## 🏥 Health Check

A health check endpoint is available:

```bash
curl https://your-health-function-url/
```

Returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "mongoConnected": true
}
```

## 🔧 Local Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set environment variables**:

   ```bash
   export MONGODB_URI="mongodb+srv://..."
   ```

3. **Build**:

   ```bash
   npm run build
   ```

4. **Run locally with Functions Framework**:
   ```bash
   npx @google-cloud/functions-framework --target=handler --source=dist
   ```

## 📁 Project Structure

```
src/
├── index.ts          # Main Cloud Function handler
├── handlers.ts       # MongoDB operation handlers
├── database.ts       # Database connection management
└── types.ts          # TypeScript type definitions
```

## ⚡ Migration from Atlas Data API

This is a **drop-in replacement**. Simply:

1. Deploy this function to Google Cloud
2. Update your application's base URL from Atlas Data API to your new function URL
3. Keep all your existing request/response handling code - it will work identically

## 🐛 Error Codes

| Code                  | Description                       |
| --------------------- | --------------------------------- |
| `INVALID_REQUEST`     | Missing required fields           |
| `MONGODB_URI_MISSING` | MongoDB connection not configured |
| `FIND_ONE_ERROR`      | Error during findOne operation    |
| `INSERT_ONE_ERROR`    | Error during insertOne operation  |
| ...                   | (and more for each operation)     |

## 📜 License

MIT License - feel free to use and modify as needed.

## 🆘 Support

If you encounter any issues or need help migrating from Atlas Data API, please open an issue in this repository.
