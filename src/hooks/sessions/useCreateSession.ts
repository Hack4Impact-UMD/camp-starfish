import { useMutation } from '@tanstack/react-query';
import { createSessionDoc } from '@/data/firestore/sessions';
import { Moment } from 'moment';
import { runTransaction, Timestamp, Transaction } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { createDaysOffScheduleDoc } from '@/data/firestore/daysOffSchedules';

interface CreateSessionRequest {
  name: string;
  startDate: Moment;
  endDate: Moment;
}

async function createSession(req: CreateSessionRequest) {
  const { name, startDate, endDate } = req;
  await runTransaction(db, async (transaction: Transaction) => {
    const sessionId = await createSessionDoc({
      name,
      startDate: Timestamp.fromDate(startDate.clone().startOf('day').toDate()),
      endDate: Timestamp.fromDate(endDate.clone().endOf('day').toDate()),
      attendeeIds: []
    }, transaction);
    await createDaysOffScheduleDoc(sessionId, {
      daysOffInSession: [],
      daysOffByCounselorId: {},
    }, transaction);
  });
}

export default function useCreateSession() {
  return useMutation({
    mutationFn: async (req: CreateSessionRequest) => createSession(req),
    onSuccess: (_data, _vars, _result, { client }) => {
      client.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
}
