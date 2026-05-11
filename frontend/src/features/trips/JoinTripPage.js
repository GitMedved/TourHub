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

    onSuccess: (trip) => {
      navigate(`/trips/${trip.id}`);
    }
  });

  useEffect(() => {
    joinMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">

      Joining trip...

    </div>
  );
}
