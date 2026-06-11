'use client';

import { db } from "@/config/firebase";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { collection, doc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import moment from "moment";

export default function TestPage() {
  return <>
  <button onClick={async () => {
    const users = await getDocs(collection(db, RootLevelCollection.USERS));
    for (const user of users.docs) {
      const userDoc = user.data();
      const updates = {
        dateOfBirth: Timestamp.fromDate(moment(userDoc.dateOfBirth).toDate()),
        isSuperAdmin: userDoc.role === "ADMIN" ? false : undefined
      };
      await updateDoc(doc(db, RootLevelCollection.USERS, user.id), updates);
    }
  }}>Migrate</button></>
}