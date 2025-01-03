# Dating Course Web Client

This is a Dating Course Web Client built with Angular 18 that integrates with PrimeNG for UI components and includes real-time communication features using SignalR.

This project is based on the Udemy course [Build an app with ASPNET Core and Angular from scratch](https://www.udemy.com/course/build-an-app-with-aspnet-core-and-angular-from-scratch) by Neil Cummings.

## Technologies & Features

- **Framework**: 
  - Angular 18.2.0
  - Express.js 4.18.2 (SSR support)
- **UI Components & Styling**:
  - PrimeNG 17.18.12
  - PrimeFlex 3.3.1
  - PrimeIcons 7.0.0
- **Real-time Communication**:
  - SignalR 8.0.7 for chat and presence tracking
- **State Management & Utilities**:
  - RxJS 7.8.0
  - TypeScript 5.5.2
- **Development Tools**:
  - Angular CLI
  - ESLint for code quality

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (v8.x or higher)
- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/) or preferred IDE
- [Backend API](https://github.com/JorgeRiveraMancilla/dating-course-api)

## Getting Started

Follow these steps to get the project up and running on your local machine:

### 1. Clone the Repository

```bash
# Clone the project
git clone https://github.com/JorgeRiveraMancilla/dating-course-web-client.git

# Navigate to the project directory
cd dating-course-web-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
ng serve -o
```

The application will be available at:
- `http://localhost:4200`

## Backend Requirements

This application requires the Dating Course API to be running. You can find the backend repository here:
[Dating Course API](https://github.com/JorgeRiveraMancilla/dating-course-api)