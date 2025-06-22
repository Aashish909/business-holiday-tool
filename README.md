# NextLeave - Holiday Management Tool

A modern holiday and time-off management application built with Next.js, MongoDB, JWT authentication, and Cloudinary for image uploads.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Role-based Access**: Admin and Employee roles with different permissions
- **Company Management**: Admins can create companies and manage employees
- **Time-off Requests**: Employees can submit and track time-off requests
- **Holiday Management**: Company-wide holiday calendar management
- **Invitation System**: Secure invitation codes for employee onboarding
- **Image Upload**: Cloudinary integration for company logos and profile images

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: MongoDB
- **Authentication**: JWT with bcryptjs for password hashing
- **File Upload**: Cloudinary
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React hooks and server actions

## Environment Variables

Create a `.env.local` file with the following variables:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/holiday-tool?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SEC=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with your configuration

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   │   └── (dashboard)/       # Protected dashboard routes
│   │   │   ├── admin/         # Admin-specific pages
│   │   │   └── employee/      # Employee-specific pages
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── onboarding/        # User onboarding
│   ├── components/            # Reusable UI components
│   │   └── ui/               # Radix UI components
│   ├── lib/                  # Utility functions
│   │   ├── actions/          # Server actions
│   │   ├── auth.ts           # JWT authentication utilities
│   │   ├── cloudinary.ts     # Cloudinary configuration
│   │   ├── db.ts             # MongoDB database operations
│   │   ├── mongodb.ts        # MongoDB connection
│   │   └── types.ts          # TypeScript type definitions
│   └── middleware.ts         # Authentication middleware
```

## Authentication Flow

1. **Registration**: Users register with email and password
2. **Login**: JWT token is generated and stored in HTTP-only cookies
3. **Onboarding**: New users complete company setup (admin) or join existing company (employee)
4. **Authorization**: Middleware validates JWT tokens and enforces role-based access

## Database Schema

The application uses MongoDB collections:

- **users**: User accounts with roles and company associations
- **companies**: Company information and settings
- **companyHolidays**: Company-specific holidays
- **codes**: Invitation codes for employee onboarding
- **timeOffRequests**: Employee time-off requests

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## Deployment

The application can be deployed to Vercel, Netlify, or any other Next.js-compatible platform. Make sure to:

1. Set up environment variables in your deployment platform
2. Configure MongoDB Atlas for production database
3. Set up Cloudinary for production image uploads

## Security Features

- JWT tokens with expiration
- HTTP-only cookies for token storage
- Password hashing with bcryptjs
- Role-based access control
- Input validation with Zod
- CORS protection
- XSS prevention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
