import React, {
  useEffect
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  useMutation
} from '@tanstack/react-query';

import {
  joinTrip
} from './trips.api';

export default function JoinTripPage() {

  const { token } = useParams();

  const navigate = useNavigate();

  const joinMutation = useMutation({
    mutationFn: () =>
      joinTrip(token),

    onSuccess: (result) => {
      navigate(`/trips/${result.trip.id}`);
    }
  });

  const { mutate } = joinMutation;

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="min-h-screen flex items-center justify-center">

      Joining trip...

    </div>
  );
}
