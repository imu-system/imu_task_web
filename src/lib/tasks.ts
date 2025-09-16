
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Task } from "./types";

export async function getTaskById(taskId: string): Promise<Task | null> {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    if (taskSnap.exists()) {
        return { id: taskSnap.id, ...taskSnap.data() } as Task;
    }
    return null;
}
