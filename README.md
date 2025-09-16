# E-Government Citizen Services Portal

![Project Banner](./Backend/public/images/banner.png)

A digital platform that allows citizens to request government services online, officers to review requests, and admins to manage the system and view reports.

---

## 🌟 Features

### User Roles

| Role                | Capabilities                                                    |
| ------------------- | --------------------------------------------------------------- |
| **Citizen**         | Submit service requests, upload documents, track request status |
| **Officer**         | Review, approve/reject requests                                 |
| **Department Head** | Manage officers, assign requests                                |
| **Admin**           | Full system management, reports & statistics                    |

---

### Service Requests Workflow

1. **Submitted** → Citizen submits a request.
2. **Under Review** → Officer reviews documents and request.
3. **Approved / Rejected** → Status is updated, citizen notified.

![Request Workflow](./Backend/public/images/requestflow.png)

## 📦 Database Structure

- **users:** All citizens, officers, admins
- **departments:** Interior, Commerce, Housing, etc.
- **services:** Offered services per department
- **requests:** Applications submitted by citizens
- **documents:** Uploaded files linked to requests
- **request_assignments:** Store assigned requests to staff
- **notifications:** User notifications

---

## 💻 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Frontend:** EJS Templates, Tailwind CSS
- **Security:** Session-based authentication, input validation

---

## 🚀 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/elhamatokhi/Capstone.git
```

Install dependencies:

```bash
npm install
```

Set up PostgreSQL database and run migrations.

Start the server:

```bash
nodemon index.js
```

Visit http://localhost:3000 in your browser.

For more details, see the [Project Wiki](https://github.com/elhamatokhi/Capstone/wiki)
