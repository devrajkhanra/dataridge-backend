# Dataridge Backend

A modular, feature-based Fastify backend API with PostgreSQL for authentication, role management, and application data.

## Features

- **User Authentication**: Register and login with JWT access/refresh tokens
- **Password Security**: Passwords hashed with bcrypt
- **Role-Based Access Control**: Many-to-many user-role relationship
- **RESTful API**: Modular endpoints for users, roles, and projects
- **Secure Token Handling**: Refresh tokens in HttpOnly cookies
- **Swagger UI**: Interactive API docs at `/docs`
- **Extensible**: Feature-based folder structure for easy scaling

## Project Structure

```
src/
  features/
    auth/
      controllers/
      models/
      routes/
    user/
      controllers/
      models/
      routes/
    role/
      controllers/
      models/
      routes/
    project/
      controllers/
      models/
      routes/
  plugins/
    db.ts
  server.ts
```

## Prerequisites

- Node.js v16+
- PostgreSQL database

## Database Setup

Create the following tables:

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE
);
```

## Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
COOKIE_SECRET=your_cookie_secret
NODE_ENV=development
```

## Installation

```bash
npm install
```

## Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`.

## API Documentation

Visit [http://localhost:3000/docs](http://localhost:3000/docs) for interactive Swagger UI.

## Authentication Endpoints

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive JWT access token (refresh token in cookie)
- `POST /auth/logout` — Logout and clear refresh token cookie

## Security Notes

- Passwords are hashed with bcrypt before storage
- JWT secrets and DB credentials are loaded from environment variables
- Refresh tokens are stored in HttpOnly cookies for security
- Use HTTPS in production

## Extending the API

- Add new features by creating folders in `src/features`
- Add new routes, controllers, and models as needed
- Register new routes in `src/server.ts`

## Useful Links

- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [pg Node.js Client](https://node-postgres.com/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js/)
- [JWT](https://jwt.io/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

## License

MIT
