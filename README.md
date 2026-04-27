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
