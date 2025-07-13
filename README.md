# DataRidge Backend API

A comprehensive TypeScript-based backend for the Daily Report Consolidation Tool with enterprise-grade security, performance, and monitoring capabilities.

## 🚀 Features

- **Enterprise Security**: JWT authentication, rate limiting, input validation, CORS protection
- **High Performance**: Connection pooling, caching layer, response compression
- **Monitoring**: Health checks, structured logging, metrics collection
- **Type Safety**: Full TypeScript implementation with comprehensive validation
- **Testing**: Unit tests, integration tests, coverage reporting
- **Documentation**: OpenAPI/Swagger documentation, comprehensive README

## 📋 Prerequisites

- Node.js 18+ 
- TypeScript 5+
- Supabase account and project
- Redis (for production caching)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dataridge-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Build the project:
```bash
npm run build
```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Legacy Mode (for backward compatibility)
```bash
npm run dev:legacy
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔍 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 📊 API Documentation

The API follows RESTful conventions with comprehensive error handling and validation.

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All API endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

### Health Checks
- `GET /health` - Comprehensive health check
- `GET /ready` - Readiness probe (Kubernetes)
- `GET /alive` - Liveness probe (Kubernetes)

### API Endpoints

#### Companies
- `GET /api/v1/companies` - List all companies (admin only)
- `GET /api/v1/companies/my` - Get user's companies
- `GET /api/v1/companies/:id` - Get company by ID
- `POST /api/v1/companies` - Create company
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company

## 🏗️ Architecture

### Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── repositories/    # Data access layer
├── services/        # Business logic layer
├── types/          # TypeScript type definitions
├── plugins/        # Fastify plugins
└── enhanced-index.ts # Enhanced application entry point
```

### Design Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Dependency Injection**: Loose coupling
- **Middleware Pattern**: Cross-cutting concerns
- **Error Handling**: Centralized error management

## 🔒 Security Features

- JWT-based authentication
- Rate limiting per user/IP
- Input validation and sanitization
- CORS protection
- Security headers (HSTS, CSP, etc.)
- SQL injection prevention
- XSS protection

## 📈 Performance Features

- Database connection pooling
- Response caching
- Request compression
- Optimized queries
- Memory usage monitoring

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_KEY` | Supabase anon key | Required |
| `LOG_LEVEL` | Logging level | `info` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

## 📝 Logging

The application uses structured logging with correlation IDs:

```json
{
  "level": "info",
  "time": "2023-01-01T00:00:00.000Z",
  "requestId": "req-123",
  "userId": "user-456",
  "action": "create_company",
  "message": "Company created successfully"
}
```

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "errors": [...]
    }
  },
  "meta": {
    "timestamp": "2023-01-01T00:00:00.000Z",
    "requestId": "req-123",
    "version": "1.0.0"
  }
}
```

## 🔄 Migration Guide

### From Legacy to Enhanced

1. Update imports to use enhanced services
2. Replace error handling with AppError
3. Add request validation middleware
4. Update authentication to enhanced version
5. Add proper logging with correlation IDs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples