<img src="src/assets/logos/darkBgLogo.png" alt="Camp Starfish logo" title="Camp Starfish" align="right" height="65" />

# ⭐️ Camp Starfish ⭐️

Welcome to the official repository for the **Camp Starfish Photo & Scheduling App**, developed by **Hack4Impact-UMD**! 🎉

This repository contains everything you need code, documentation, and setup guides to effectively contribute to the Camp Starfish app. Follow the setup guide below to get started quickly. Feel free to reach out to the team if you have any questions!

---

## 📖 Quick Navigation

- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Team Contacts](#team-contacts)

---

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
```bash
npm install -g firebase-tools
firebase emulators:start
```

⚠️ **Use the Firebase Emulator for local testing only.**

---

## 🏗️ System Design

Here's how the project directories are structured:

```
camp-starfish/
│── .next/
│── functions/
│── node_modules/
│── public/
│── src/
│   ├── app/                # Main app logic and pages
│   ├── assets/             # Images and static files
│   ├── auth/               # Authentication modules
│   ├── components/         # UI components
│   ├── config/             # App configurations
│   ├── data/               # Data operations
│   ├── types/              # Type definitions
│
│── .env
│── .firebaserc
│── .gitignore
│── firebase.json
│── firestore.rules
│── next.config.ts
│── package.json
│── README.md
```

---

## 📞 Team Contacts

| Name                 | Role                | Contact                          |
|----------------------|---------------------|----------------------------------|
| **Nitin Kanchinadam**| Tech Lead           | nitin.kanchinadam@gmail.com      |
| **Benjamin Enwesi**  | Tech Lead           | benwesi@terpmail.umd.edu         |


---

🎉 **Happy coding!** Together, we’ll make Camp Starfish amazing! ⭐️
