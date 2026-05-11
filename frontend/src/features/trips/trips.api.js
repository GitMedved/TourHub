import api from '../../services/api';

export const getTrips = async () => {
  const response = await api.get('/trips');
  return response.data;
};

export const getTripById = async (tripId) => {
  const response = await api.get(
    `/trips/${tripId}`
  );

  return response.data;
};

export const createTrip = async (data) => {
  const response = await api.post(
    '/trips',
    data
  );

  return response.data;
};

export const addPlace = async (
  tripId,
  data
) => {

  const response = await api.post(
    `/trips/${tripId}/places`,
    data
  );

  return response.data;
};

export const addComment = async (
  tripId,
  data
) => {

  const response = await api.post(
    `/trips/${tripId}/comments`,
    data
  );

  return response.data;
};

export const voteForPlace = async (
  placeId,
  value
) => {

  const response = await api.post(
    `/trips/places/${placeId}/vote`,
    { value }
  );

  return response.data;
};
