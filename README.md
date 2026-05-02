# Eduhub - Modern Learning Management System (LMS)

Eduhub is a comprehensive, full-stack Learning Management System built with the MERN stack. It empowers instructors to create courses with dynamic video content, automatically generate quizzes using AI, and engage with students in real-time. For students, it provides a seamless learning experience with progress tracking, secure course purchasing, and collaborative chatrooms.

## 🚀 Key Features

### For Students
* **Course Discovery:** Browse, filter, and sort a wide variety of courses. Add courses to a personal wishlist.
* **Interactive Learning:** Track course progress and consume video content.
* **Real-time Collaboration:** Join course-specific chatrooms (via Socket.io) exclusively available to verified enrolled students.
* **Ratings & Reviews:** Leave reviews and ratings for completed courses.
* **Secure Payments:** Purchase courses safely with integrated PayPal SDK.

### For Instructors
* **Course Management:** Create, edit, and publish comprehensive courses with rich media support.
* **AI Quiz Generation:** Automatically generate structured, module-specific quizzes directly from course video transcripts using Google's Gemini AI.
* **Student Engagement:** Answer queries and foster community in real-time course chatrooms.

### Architecture & Performance
* **Role-Based Access Control:** Secure JWT authentication separating Admins, Instructors, and Students.
* **High Performance:** Redis caching implementation with robust cache invalidation strategies triggered by content updates, ensuring lightning-fast query speeds.
* **State Management:** Efficient client-side state handling utilizing Zustand.
* **Responsive UI/UX:** A modernized, highly responsive design tailored for a premium user experience.

## 🛠️ Tech Stack

* **Frontend:** React.js, Zustand (State Management), Tailwind CSS / Shadcn UI
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Caching:** Redis
* **Real-time Communication:** Socket.io
* **AI Integration:** Google Gemini AI
* **Payments:** PayPal SDK
* **Authentication:** JSON Web Tokens (JWT)
* **Deployment:** Vercel (Frontend), Render (Backend)

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18 or higher)
* MongoDB database
* Redis server
* PayPal Developer Account
* Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/raghav-lgtm/lms.git
   cd Eduhub
   ```

2. **Setup the Backend Server**
   ```bash
   cd Server
   npm install
   ```
   *Create a `.env` file in the `Server` directory with the following variables:*
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_secret
   ```
   *Start the backend development server:*
   ```bash
   npm run dev
   ```

3. **Setup the Frontend Client**
   ```bash
   cd ../Client
   npm install
   ```
   *Create a `.env` file in the `Client` directory:*
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```
   *Start the frontend development server:*
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:5173`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/raghav-lgtm/lms/issues).

## 📄 License
This project is licensed under the MIT License.

