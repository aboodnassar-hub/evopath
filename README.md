# EvoPath

EvoPath is a multi-portal corporate culture platform that connects companies, vendors, and employees around team activities, volunteer opportunities, custom requests, bookings, and employee engagement.

The app is built with React and Tailwind CSS. By default, it expects a backend API running locally at `http://localhost:5000`.

## Product Idea

EvoPath helps HR teams build stronger company culture by giving them one place to:

- Discover and book corporate activities from approved vendors.
- Create volunteer opportunities for employees.
- Manage employees registered under their company code.
- Submit custom activity requests.
- Track bookings, volunteer participation, and engagement.
- Let employees vote on team activities through polling.

The platform supports four main roles:

- `Admin`: manages HR company accounts, approves vendors, and views platform stats.
- `HR`: manages employees, books activities, creates volunteer opportunities, and submits custom requests.
- `Vendor`: publishes activities, reviews bookings, and responds to custom requests.
- `Employee`: joins volunteer opportunities, views impact, and participates in polls.

## Features

- Role-based portal routing after login.
- Admin dashboard with company, vendor, employee, and pending vendor stats.
- HR company management with generated company codes.
- Vendor approval flow.
- Activity marketplace with booking requests.
- Vendor booking approval and rejection.
- Custom request flow between HR and vendors.
- Volunteer opportunity creation, joining, and completion tracking.
- Employee impact dashboard with culture points and volunteer hours.
- Shared sidebar, mobile header, activity cards, and reset PIN modal.

## Tech Stack

- React
- Tailwind CSS
- Lucide React icons
- Create React App
- Backend API expected at `http://localhost:5000`

## Project Structure

```text
src/
  App.js
  components/
    shared.jsx
  features/
    admin/
    employee/
    hr/
    vendor/
  pages/
    LandingPage.jsx
  utils/
    api.js
    constants.js
    i18n.js
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

The frontend expects the backend API at:

```text
http://localhost:5000
```

To use a different backend URL, create a local `.env.local` file:

```bash
REACT_APP_API_BASE_URL=http://localhost:5000
```

You can use `.env.example` as the template.

## Available Scripts

```bash
npm start
```

Runs the app in development mode.

```bash
npm run build
```

Builds the app for production.

```bash
npm test
```

Runs the test runner.

## Notes

- This repository contains the React frontend.
- A backend server is required for login, users, activities, bookings, custom requests, volunteer opportunities, and stats.
- Some UI pieces are still prototype-level and can be improved by unifying shared components, moving API calls into helper modules, and replacing local placeholder logic with backend-backed data.

## Suggested Next Improvements

- Split the remaining large feature files into smaller component files.
- Move more feature-specific API calls into small API modules.
- Add more Arabic dictionary entries as new UI copy is introduced.
- Add a short demo script or seed data guide once the backend setup is included.
