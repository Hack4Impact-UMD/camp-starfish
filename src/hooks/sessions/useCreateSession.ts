import { useMutation } from '@tanstack/react-query';
import { createSessionDoc } from '@/data/firestore/sessions';
import { Moment } from 'moment';
import { Timestamp } from 'firebase/firestore';

interface CreateSessionRequest {
  name: string;
  startDate: Moment;
  endDate: Moment;
}

async function createSession(req: CreateSessionRequest) {
  const { name, startDate, endDate } = req;
  await createSessionDoc({
    name,
    startDate: Timestamp.fromDate(startDate.toDate()),
    endDate: Timestamp.fromDate(endDate.toDate())
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
