# Dataridge Backend

The **Dataridge Backend** is an enterprise-grade, modular, and scalable backend solution designed for the construction industry. Built with TypeScript, Fastify, Supabase, and Zod, it provides robust APIs to manage companies, labor, projects, and dynamic schemas, tailored for construction roles like General Laborer, Coolie, and Piling Operator. The backend features enterprise-level security, performance optimization, comprehensive error handling, and monitoring capabilities.

## 🚀 Features

### ✅ Implemented Features

#### Core Construction Management
1. **Company Management**:
   - Enhanced CRUD operations with validation and caching
   - Company-specific schema management (`company_user_schemas`)
   - Email and name uniqueness validation
   - Endpoints: `GET /api/v1/companies`, `POST /api/v1/companies`, `PUT /api/v1/companies/:id`, `DELETE /api/v1/companies/:id`

2. **Labor Management**:
   - Comprehensive labor details management for construction workers
   - Support for 20+ construction designations (General Laborer, Coolie, Piling Operator, etc.)
   - Dynamic designation management via `roles.json`
   - Employee ID, PF number, ESI number tracking
   - Endpoints: `GET /api/v1/labor`, `POST /api/v1/labor`, `GET /api/v1/labor/designations`, `POST /api/v1/labor/designations`

3. **Project Management**:
   - Project creation with dynamic table schemas
   - Company and user associations
   - Schema validation and management
   - Endpoints: `GET /api/v1/projects`, `POST /api/v1/projects`

4. **Template Management**:
   - Reusable table templates for construction data
   - Company-specific template storage
   - Endpoints: `GET /api/v1/templates`, `POST /api/v1/templates`

#### Enterprise Features
5. **Enhanced Security**:
   - JWT-based authentication with token blacklisting
   - Role-based access control (`admin`, `user`)
   - Rate limiting per user/IP
   - Input validation and sanitization
   - Security headers (CORS, HSTS, CSP, XSS protection)
   - SQL injection and XSS prevention

6. **Performance Optimization**:
   - Database connection pooling
   - Redis-ready caching layer
   - Response compression (gzip/deflate)
   - Query optimization with pagination
   - Memory usage monitoring

7. **Monitoring & Health Checks**:
   - Kubernetes-ready health endpoints (`/health`, `/ready`, `/alive`)
   - Structured logging with correlation IDs
   - Performance metrics collection
   - Error tracking and reporting

8. **Data Management**:
   - Generic CRUD operations with enhanced validation
   - Flexible construction data storage
   - Endpoints: `GET /api/v1/data`, `POST /api/v1/data`, `DELETE /api/v1/data/:id`

9. **User & Role Management**:
   - Enhanced user management with company associations
   - Role-based permissions system
   - Endpoints: `GET /api/v1/users`, `POST /api/v1/users`, `DELETE /api/v1/users/:id`
   - Endpoints: `GET /api/v1/roles`, `POST /api/v1/roles`, `DELETE /api/v1/roles/:id`

10. **Notifications System**:
    - Construction-specific event notifications
    - Support for `labor_added`, `project_added`, `template_added`, etc.
    - Extensible notification delivery system

### 🔄 Planned Features
1. **Advanced Labor Features**:
   - Equipment tracking (shovels, pile drivers, machinery)
   - Training records management
   - Safety compliance tracking
   - Performance analytics

2. **Project Enhancements**:
   - Material tracking (prefabricated components, cross-laminated timber)
   - Progress monitoring and reporting
   - Resource allocation optimization
   - Timeline management

3. **Analytics & Reporting**:
   - Labor productivity metrics
   - Project cost analysis
   - Material usage reports
   - Safety incident tracking

4. **Advanced Security**:
   - Multi-factor authentication
   - Audit logging
   - Advanced RLS policies
   - API key management

## 🛠️ Tech Stack

### Core Technologies
- **Node.js 18+**: Runtime environment for scalable backend development
- **TypeScript 5+**: Static typing for robust, maintainable code
- **Fastify 4**: High-performance web framework with plugin ecosystem
- **Supabase**: PostgreSQL-based database with Row Level Security
- **Zod**: Runtime type validation and schema parsing

### Enterprise Features
- **Pino**: Structured logging with correlation IDs
- **JWT**: Secure authentication and authorization
- **Redis**: Caching and session management (production)
- **Jest**: Comprehensive testing framework
- **ESLint**: Code quality and consistency

### Security & Performance
- **Helmet**: Security headers middleware
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request throttling and abuse prevention
- **Compression**: Response compression for performance

## 📁 Project Structure

```
dataridge-backend/
├── src/
│   ├── config/
│   │   ├── env.ts                    # Environment configuration
│   │   └── database.ts               # Database connection management
│   ├── controllers/
│   │   ├── company/                  # Company management (legacy)
│   │   ├── enhanced-company/         # Enhanced company management
│   │   ├── data/                     # Generic data operations
│   │   ├── labor/                    # Labor management
│   │   ├── projects/                 # Project management
│   │   ├── roles/                    # Role management
│   │   ├── schema/                   # Schema management
│   │   ├── template/                 # Template management
│   │   └── users/                    # User management
│   ├── middleware/
│   │   ├── auth.ts                   # Legacy authentication
│   │   ├── enhanced-auth.ts          # Enhanced authentication
│   │   ├── validation.ts             # Input validation & sanitization
│   │   ├── security.ts               # Security headers & rate limiting
│   │   ├── error.ts                  # Legacy error handling
│   │   ├── enhanced-error.ts         # Enhanced error handling
│   │   ├── health.ts                 # Health check endpoints
│   │   └── restrictTo.ts             # Role-based access control
│   ├── plugins/
│   │   ├── jwt.ts                    # JWT configuration
│   │   ├── logging.ts                # Logging setup
│   │   └── supabase.ts               # Supabase integration
│   ├── repositories/
│   │   ├── base.repository.ts        # Base repository pattern
│   │   └── company.repository.ts     # Company data access
│   ├── services/
│   │   ├── designations.service.ts   # Construction designations
│   │   ├── notification.service.ts   # Notification system
│   │   ├── supabase.service.ts       # Supabase operations
│   │   ├── enhanced-company.service.ts # Enhanced company logic
│   │   ├── cache.service.ts          # Caching abstraction
│   │   └── logger.service.ts         # Structured logging
│   ├── types/
│   │   ├── index.ts                  # Legacy type definitions
│   │   └── common.ts                 # Enhanced type definitions
│   ├── index.ts                      # Legacy entry point
│   └── enhanced-index.ts             # Enhanced entry point
├── tests/
│   ├── setup.ts                      # Test configuration
│   └── unit/                         # Unit tests
├── roles.json                        # Construction designations
├── .env.example                      # Environment template
├── .eslintrc.js                      # Code quality rules
├── jest.config.js                    # Test configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies and scripts
└── README.md                         # This file
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Supabase account and project
- Redis (for production caching)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/devrajkhanra/dataridge-backend.git
   cd dataridge-backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Environment
   NODE_ENV=development
   PORT=3000
   API_VERSION=1.0.0
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   
   # Security
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Build the Project**:
   ```bash
   npm run build
   ```

5. **Run the Application**:
   
   **Development (Enhanced)**:
   ```bash
   npm run dev
   ```
   
   **Development (Legacy)**:
   ```bash
   npm run dev:legacy
   ```
   
   **Production**:
   ```bash
   npm start
   ```

### Database Setup

1. **Create Supabase Project**: Set up a new project at [supabase.com](https://supabase.com)

2. **Apply Database Schema**: Use the Supabase SQL editor to create the required tables:
   ```sql
   -- Companies table
   CREATE TABLE companies (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL UNIQUE,
     logo_url TEXT,
     contact_email TEXT NOT NULL UNIQUE,
     contact_phone TEXT,
     address TEXT,
     user_id UUID NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Enable RLS
   ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
   
   -- Add other tables as needed...
   ```

3. **Configure RLS Policies**: Set up Row Level Security policies based on your requirements.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📊 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All API endpoints require JWT authentication:
```bash
Authorization: Bearer <your-jwt-token>
```

### Health Endpoints
- `GET /health` - Comprehensive system health check
- `GET /ready` - Kubernetes readiness probe
- `GET /alive` - Kubernetes liveness probe

### Construction Management APIs

#### Companies
```bash
# Get all companies (admin only)
GET /api/v1/companies

# Get user's companies
GET /api/v1/companies/my

# Get company by ID
GET /api/v1/companies/:id

# Create company
POST /api/v1/companies
{
  "name": "ABC Construction",
  "contact_email": "contact@abc.com",
  "contact_phone": "+1234567890",
  "address": "123 Construction Ave"
}

# Update company
PUT /api/v1/companies/:id

# Delete company
DELETE /api/v1/companies/:id
```

#### Labor Management
```bash
# Get labor records
GET /api/v1/labor

# Add labor
POST /api/v1/labor
{
  "company_id": "uuid",
  "project_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "employee_id": "EMP001",
  "designation": "General Laborer",
  "joining_date": "2025-01-15"
}

# Get designations
GET /api/v1/labor/designations

# Add designation
POST /api/v1/labor/designations
{
  "designation": "Crane Operator"
}
```

### Error Responses
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
    "timestamp": "2025-01-15T10:00:00.000Z",
    "requestId": "req-123",
    "version": "1.0.0"
  }
}
```

## 🏗️ Architecture

### Design Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation  
- **Dependency Injection**: Loose coupling
- **Middleware Pattern**: Cross-cutting concerns
- **Factory Pattern**: Service instantiation

### Security Features
- JWT authentication with token blacklisting
- Rate limiting (100 requests/15 minutes per user)
- Input validation and sanitization
- CORS protection with configurable origins
- Security headers (HSTS, CSP, XSS protection)
- SQL injection prevention
- Error message sanitization

### Performance Features
- Database connection pooling (max 10 connections)
- Response caching with TTL
- Request/response compression
- Optimized database queries
- Memory usage monitoring

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `HOST` | Server host | `0.0.0.0` | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `SUPABASE_URL` | Supabase project URL | - | Yes |
| `SUPABASE_KEY` | Supabase anon key | - | Yes |
| `LOG_LEVEL` | Logging level | `info` | No |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` | No |

### Construction Designations
The system supports 20+ construction roles defined in `roles.json`:
- General Laborer
- Welder
- Safety Officer
- Carpenter
- Electrician
- Mason
- Plant Operator
- Coolie
- Piling Operator
- Plumber
- Painter
- Rigger
- Scaffolder
- Bar Bender
- Tile Setter
- Crane Operator
- Concrete Mixer Operator
- Surveyor Assistant
- Helper
- Other

## 📈 Monitoring & Observability

### Logging
Structured logging with correlation IDs:
```json
{
  "level": "info",
  "time": "2025-01-15T10:00:00.000Z",
  "requestId": "req-123",
  "userId": "user-456",
  "action": "create_company",
  "message": "Company created successfully",
  "metadata": {
    "companyId": "comp-789",
    "name": "ABC Construction"
  }
}
```

### Health Monitoring
- System health checks with service status
- Memory and CPU usage monitoring
- Database connection health
- Cache service availability
- Response time tracking

### Performance Metrics
- Request/response times
- Error rates by endpoint
- Cache hit/miss ratios
- Database query performance
- Memory usage patterns

## 🚀 Deployment

### Docker Support (Planned)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/enhanced-index.js"]
```

### Kubernetes Deployment (Planned)
- Health check endpoints for probes
- Graceful shutdown handling
- Environment-based configuration
- Horizontal pod autoscaling support

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request with clear description

### Coding Standards
- Follow TypeScript best practices
- Use Zod for all input validation
- Implement proper error handling
- Add comprehensive logging
- Write unit tests for new features
- Follow the established architecture patterns

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Critical bug fixes

## 📋 Roadmap

### Phase 1: Core Enhancements (Q1 2025)
- [ ] Complete migration to enhanced architecture
- [ ] Comprehensive test coverage (>80%)
- [ ] API documentation with OpenAPI/Swagger
- [ ] Performance optimization

### Phase 2: Advanced Features (Q2 2025)
- [ ] Equipment tracking system
- [ ] Material management
- [ ] Advanced analytics and reporting
- [ ] Mobile API optimizations

### Phase 3: Enterprise Features (Q3 2025)
- [ ] Multi-tenant architecture
- [ ] Advanced security features
- [ ] Audit logging
- [ ] Integration APIs

### Phase 4: Analytics & AI (Q4 2025)
- [ ] Predictive analytics
- [ ] Resource optimization
- [ ] Safety compliance automation
- [ ] Performance insights

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

### Documentation
- [API Documentation](docs/api.md) (Coming Soon)
- [Architecture Guide](docs/architecture.md) (Coming Soon)
- [Deployment Guide](docs/deployment.md) (Coming Soon)

### Community
- **Issues**: [GitHub Issues](https://github.com/devrajkhanra/dataridge-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/devrajkhanra/dataridge-backend/discussions)
- **Email**: [Contact](mailto:contact@dataridge.com)

### Enterprise Support
For enterprise support, custom features, or consulting services, please contact our team.

---

**Built with ❤️ for the Construction Industry**