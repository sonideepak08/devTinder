# DevTinder

A "Tinder for developers" backend. Developers sign up, build a profile, browse a feed of other developers, and send connection requests (_interested_ / _ignored_). Recipients can accept or reject requests, and accepted requests become connections. The API also includes paid membership orders (Razorpay) and email notifications (AWS SES).

## Features

- **Authentication**: sign up, login, and logout using JWT stored in an HTTP-only cookie (7-day expiry); passwords hashed with bcrypt
- **Profile management**: view and edit profile, change password
- **Connection requests**: send _interested_ / _ignored_, and review with _accepted_ / _rejected_
- **Feed**: paginated list of users you haven't interacted with yet (max 50 per page)
- **Connections**: list of all accepted connections
- **Payments**: create Razorpay orders for Silver / Gold memberships (INR)
- **Email notifications**: AWS SES email when a request is sent, plus a daily cron job that emails users about pending requests
- **Validation**: Mongoose schema validation and request validation via `validator`

## Tech Stack

| Area                | Technology                             |
| ------------------- | -------------------------------------- |
| Runtime / Framework | Node.js, Express 5                     |
| Database            | MongoDB with Mongoose 9                |
| Auth                | jsonwebtoken, bcrypt, cookie-parser    |
| Payments            | Razorpay                               |
| Email               | AWS SES (`@aws-sdk/client-ses`)        |
| Scheduling          | node-cron, date-fns                    |
| Other               | cors, dotenv, validator, nodemon (dev) |

## Project Structure

```
devTinder/
├── src/
│   ├── app.js                  # Express app entry point
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # userAuth (JWT cookie check)
│   ├── models/
│   │   ├── user.js
│   │   ├── connectionRequest.js
│   │   └── payment.js
│   ├── routes/
│   │   ├── auth.js             # signup / login / logout
│   │   ├── profile.js          # view / edit / password
│   │   ├── request.js          # send / review requests
│   │   ├── user.js             # received requests / connections / feed
│   │   └── payment.js          # create Razorpay order
│   └── utils/
│       ├── cronjobs.js         # daily pending-request email job
│       ├── razorpay.js         # Razorpay client
│       ├── sendEmail.js        # SES email helper
│       ├── sesClient.js        # SES client (region: ap-south-1)
│       └── validation.js       # signup / edit-profile validation
├── apiList.md
├── package.json
└── .env                        # not committed (see below)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or MongoDB Atlas)
- (Optional) Razorpay account and AWS account with SES configured, for payments and emails

### Installation

```bash
git clone <your-repo-url>
cd devTinder
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_CONNECTION_SECRET=<your MongoDB connection string>
JWT_SECRET=<a long random string>

# AWS SES
AWS_ACCESS_KEY_ID=<your key>
AWS_SECRET_ACCESS_KEY=<your secret>

# Razorpay
RAZORPAY_KEY_ID=<your key id>
RAZORPAY_KEY_SECRET=<your key secret>
SILVER_MEMBERSHIP_AMOUNT=<amount in INR, e.g. 299>
GOLD_MEMBERSHIP_AMOUNT=<amount in INR, e.g. 599>
```

### Run

```bash
# development (auto-reload with nodemon)
npm run dev

# production
npm start
```

The server starts on `PORT` after a successful database connection.

> The CORS config currently allows requests only from `http://localhost:5173` (the frontend dev server) with credentials enabled. Update `src/app.js` when deploying.

## API Reference

All routes are mounted at `/`. Routes marked 🔒 require a valid login cookie.

### Auth

| Method | Endpoint     | Description                                                    |
| ------ | ------------ | -------------------------------------------------------------- |
| POST   | `/signup`    | Register a user (`firstName`, `lastName`, `email`, `password`) |
| POST   | `/login`     | Login with `email` and `password`                              |
| POST   | `/logout` 🔒 | Clear the auth cookie                                          |

### Profile

| Method | Endpoint               | Description                                                                             |
| ------ | ---------------------- | --------------------------------------------------------------------------------------- |
| GET    | `/profile/view` 🔒     | Get the logged-in user's profile                                                        |
| PATCH  | `/profile/edit` 🔒     | Edit `firstName`, `lastName`, `email`, `age`, `gender`, `skills`, `pictureUrl`, `about` |
| PATCH  | `/profile/password` 🔒 | Update password (`password` in body)                                                    |

### Connection Requests

| Method | Endpoint                                | Description                                                     |
| ------ | --------------------------------------- | --------------------------------------------------------------- |
| POST   | `/request/send/:status/:userId` 🔒      | Send a request. `status` is `interested` or `ignored`           |
| POST   | `/request/review/:status/:requestId` 🔒 | Review a received request. `status` is `accepted` or `rejected` |

### Users

| Method | Endpoint                    | Description                                                          |
| ------ | --------------------------- | -------------------------------------------------------------------- |
| GET    | `/user/request/received` 🔒 | Pending (_interested_) requests sent to you                          |
| GET    | `/user/connections` 🔒      | Your accepted connections                                            |
| GET    | `/feed?page=1&limit=10` 🔒  | Profiles you haven't connected with or acted on (limit capped at 50) |

### Payments

| Method | Endpoint             | Description                                                               |
| ------ | -------------------- | ------------------------------------------------------------------------- |
| POST   | `/payment/create` 🔒 | Create a Razorpay order. Body: `{ "membershipType": "Silver" \| "Gold" }` |

## Data Models

- **User**: `firstName`, `lastName`, `email` (unique), `password` (hashed), `age`, `gender` (`male` / `female` / `other`), `skills[]`, `pictureUrl`, `about`, timestamps
- **ConnectionRequest**: `fromUserId`, `toUserId`, `status` (`ignored` / `interested` / `accepted` / `rejected`), timestamps
- **Payment**: `userId`, `orderId`, `paymentId`, `amount`, `currency`, `status`, `receipt`, `notes` (name, membership type), timestamps

## Scheduled Jobs

`src/utils/cronjobs.js` runs a daily `node-cron` job that finds _interested_ requests created that day and emails the recipients a reminder to log in and respond.

## Contributing

Contributions are welcome. Fork the repo, create a feature branch, and open a pull request.

## License

ISC
