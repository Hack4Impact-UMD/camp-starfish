export async function getEmployeeById(
    transaction: Transaction,
    db: Firestore,
    id: string | number
): Promise<Employee> {
    try {
        const ref = db.collection(EMPLOYEES_COLLECTION);
        if (typeof id === 'string') {
            const doc = ref.doc(id);
            const snap = await transaction.get(doc);
            if (!snap.exists) throw new Error(`No employee found with uid "${id}"`);
            return snap.data() as Employee;
        } else {
            const snap = await transaction.get(ref.where('campminderId', '==', id));
            if (snap.empty) throw new Error(`No employee found with campminderId ${id}`);
            return snap.docs[0].data() as Employee;
        }
    } catch (e) {
        throw new Error(`getEmployeeById failed: ${e}`);
    }
}

export async function getEmployeeByEmail(
    transaction: Transaction,
    db: Firestore,
    email: string
): Promise<Employee> {
    try {
        const ref = db.collection(EMPLOYEES_COLLECTION);
        const snap = await transaction.get(ref.where('email', '==', email));
        if (snap.empty) throw new Error(`No employee found with email "${email}"`);
        return snap.docs[0].data() as Employee;
    } catch (e) {
        throw new Error(`getEmployeeByEmail failed: ${e}`);
    }
}

export async function createEmployee(
    transaction: Transaction,
    db: Firestore,
    employee: Employee
): Promise<void> {
    try {
        const ref = db.collection(EMPLOYEES_COLLECTION);
        const doc = employee.uid ? ref.doc(employee.uid) : ref.doc();
        transaction.set(doc, employee);
    } catch (e) {
        throw new Error(`createEmployee failed: ${e}`);
    }
}

export async function updateEmployee(
    transaction: Transaction,
    db: Firestore,
    id: string | number,
    updates: Partial<Employee>
): Promise<void> {
    try {
        const ref = db.collection(EMPLOYEES_COLLECTION);
        if (typeof id === 'string') {
            const doc = ref.doc(id);
            const snap = await transaction.get(doc);
            if (!snap.exists) throw new Error(`No employee found with uid "${id}"`);
            transaction.update(doc, updates);
        } else {
            const snap = await transaction.get(ref.where('campminderId', '==', id));
            if (snap.empty) throw new Error(`No employee found with campminderId ${id}`);
            const doc = ref.doc(snap.docs[0].id);
            transaction.update(doc, updates);
        }
    } catch (e) {
        throw new Error(`updateEmployee failed: ${e}`);
    }
}

export async function deleteEmployee(
    transaction: Transaction,
    db: Firestore,
    id: string | number
): Promise<void> {
    try {
        const ref = db.collection(EMPLOYEES_COLLECTION);
        if (typeof id === 'string') {
            const doc = ref.doc(id);
            const snap = await transaction.get(doc);
            if (!snap.exists) throw new Error(`No employee found with uid "${id}"`);
            transaction.delete(doc);
        } else {
            const snap = await transaction.get(ref.where('campminderId', '==', id));
            if (snap.empty) throw new Error(`No employee found with campminderId ${id}`);
            const doc = ref.doc(snap.docs[0].id);
            transaction.delete(doc);
        }
    } catch (e) {
        throw new Error(`deleteEmployee failed: ${e}`);
    }
}
