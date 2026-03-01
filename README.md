<img src="src/assets/logos/darkBgLogo.png" alt="Camp Starfish logo" title="Camp Starfish" align="right" height="65" />

# ⭐️ Camp Starfish ⭐️

Welcome to the official repository for the **Camp Starfish Photo & Scheduling App**, developed by **Hack4Impact-UMD**! 🎉

This project is a web application designed to streamline photo management and scheduling operations for Camp Starfish. It provides an intuitive interface for managing camp activities, photos, and administrative tasks.

This repository contains everything you need code, documentation, and setup guides to effectively contribute to the Camp Starfish app. Follow the setup guide below to get started quickly. Feel free to reach out to the team if you have any questions!

---

## 📖 Quick Navigation

- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Team Contacts](#team-contacts)

## 🛠️ Tech Stack
### **Frontend**
- Framework: **Next.js**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- UI Components: **Mantine UI**
- Data Fetching: **Tanstack Query**
- Tables: **Tanstack Table**
- Forms: **Tanstack Form**
- Schema Validation: **Zod**
  
### **Backend**
- Runtime: **Node.js**
- Cloud Provider: **Firebase**
  - Firestore Database
  - Authentication
  - Cloud Functions
  - Cloud Storage
  - Hosting
- Google Drive Integration: **Google Apps Script**
- Language: **TypeScript**
- Schema Validation: **Zod**

## ⚙️ Environment Setup

Get started quickly by setting up your local environment:

### 📂 Initial Steps

1. **GitHub SSH Configuration:**  
   - Follow this [GitHub Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

2. **Clone the Repository:**
   ```bash
   git clone git@github.com:Hack4Impact-UMD/camp-starfish.git
   cd camp-starfish
   ```

### 🌐 Running the App Locally

Install dependencies and run the development server:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your running application.

### 🔥 Firebase Local Emulator

To simulate Firebase locally:
1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```
2. Install dependencies
```bash
cd functions
npm install
```
3. Run Emulators with Test Data
```bash
firebase emulators:start ./testData
```

4. Start the Local Development Server
Open a new terminal and run the following:
```bash
npm run dev
```

5. Compile Cloud Functions
To compile Cloud Functions locally, open a new terminal and run the following:
```bash
cd functions
npm run build
```

⚠️ **Use the Firebase Emulators for local testing only.**

## 🏗️ System Design

Here's how the project directories are structured:

```
camp-starfish/
│── .next/
├── functions/              # Firebase Cloud Functions
│   ├── src/                # Function source code
│   ├── package.json        # Functions dependencies
│   └── tsconfig.json       # TypeScript config for functions
├── apps-script/            # Google Apps Script code
│── node_modules/
│── public/
│── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── [routes]/       # Dynamic routes
│   ├── assets/             # Images and static files
│   ├── auth/               # Authentication modules
│   ├── components/         # UI components
│   │   ├── common/         # Shared components
│   │   └── [feature]/      # Feature-specific components
│   ├── config/             # App configurations
│   ├── data/               # Data operations
|   ├── features/           # Individual app features
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global styles and themes
│   ├── types/              # Type definitions
│   └── utils/              # Utility functions and helpers
├── test/                   # Test files and test data
│   └── testData/           # Firebase emulator test data
│── .env
│── .firebaserc
│── .gitignore
│── eslint.config.mjs
│── firebase.json
│── firestore.indexes.json
│── firestore.rules
│── next.config.ts
│── package-lock.json
│── package.json
│── postcss.config.mjs
│── storage.rules
│── tailwind.config.ts
│── tsconfig.json
└── README.md               # This file
```

## 🔀 Pull Request Guidelines

Before submitting a PR, please ensure it meets the following criteria:
### **PR Checklist**
- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] Branch is up to date with `main`
- [ ] Commit messages are clear and descriptive
- [ ] No console.logs or debugging code left behind
- [ ] Proper comments where necessary
- [ ] TypeScript types are properly defined
- [ ] Tested in Firebase Emulator environment
- [ ] Corresponding issue is linked to PR

### **PR Instructions**
- Create a pull request
- Request and assign tech leads as reviewers
- Review and address comments by making requested changes
- Once approved, tech leads will merge your PR
- Delete your feature branch after merge

---

## 📞 Team Contacts

| Name                 | Role                | Contact                          |
|----------------------|---------------------|----------------------------------|
| **Nitin Kanchinadam**| Tech Lead           | nitin.kanchinadam@gmail.com      |
| **Esha Vigneswaran** | Tech Lead           | eshav@terpmail.umd.edu           |

## 👥 Meet the Team

---

🎉 **Happy coding!** Together, we’ll make Camp Starfish amazing! ⭐️
