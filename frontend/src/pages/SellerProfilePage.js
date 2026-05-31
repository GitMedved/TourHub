import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';
import api from '../services/api';

const SellerProfilePage = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [sellerRes, eventsRes, reviewsRes] = await Promise.all([
        api.get(`/sellers/${id}`),
        api.get(`/sellers/${id}/events`),
        api.get(`/reviews/seller/${id}`)
      ]);
      
      setSeller(sellerRes.data);
      setEvents(eventsRes.data.content || eventsRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Error loading seller profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Продавец не найден</p>
        </div>
      </div>
    );
  }

  const avgSellerRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.sellerRating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Профиль продавца */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-3xl text-white font-bold">
              {seller.companyName?.[0] || 'S'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{seller.companyName}</h1>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-semibold text-lg">{avgSellerRating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{reviews.length} отзывов</span>
              </div>

              {seller.description && (
                <p className="text-gray-600 mt-3">{seller.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {seller.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaMapMarkerAlt className="text-red-400" />
                    {seller.address}
                  </div>
                )}
                {seller.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaPhone className="text-green-400" />
                    {seller.phone}
                  </div>
                )}
                {seller.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaEnvelope className="text-blue-400" />
                    {seller.email}
                  </div>
                )}
                {seller.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaGlobe className="text-purple-400" />
                    <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {seller.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* События продавца */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">События организатора</h2>
              
              {events.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Нет активных событий</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map(event => (
                    <Link
                      to={`/event/${event.id}`}
                      key={event.id}
                      className="border rounded-xl p-4 hover:shadow-md transition group"
                    >
                      <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-3 flex items-center justify-center text-white text-2xl overflow-hidden">
                        {event.previewImage ? (
                          <img src={`http://localhost:5001${event.previewImage}`} alt="" className="w-full h-full object-cover" />
                        ) : '🏔️'}
                      </div>
                      <h3 className="font-semibold group-hover:text-blue-600 transition line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-blue-600 font-bold">${parseFloat(event.price).toFixed(0)}</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaStar className="text-yellow-400 mr-1" />
                          {event.rating || '0.0'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Отзывы */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Отзывы ({reviews.length})</h2>
              
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Пока нет отзывов</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">
                            {review.User?.firstName} {review.User?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 text-sm mr-1" />
                          <span className="font-semibold text-sm">{review.sellerRating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      {review.Event && (
                        <Link to={`/event/${review.Event.id}`} className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                          Событие: {review.Event.title}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;
