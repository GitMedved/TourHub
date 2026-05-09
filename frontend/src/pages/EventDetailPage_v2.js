// Добавить этот блок после SellerEvents компонента, перед return
// Найдите блок:
// {event.sellerId && <SellerEvents sellerId={event.sellerId} currentEventId={event.id} />}
// И замените на:

const EventReviews = ({ eventId }) => {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`/reviews/event/${eventId}`);
        setReviews(response.data || []);
      } catch (error) { console.error('Error loading reviews:', error); }
    })();
  }, [eventId]);
  
  if (reviews.length === 0) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Отзывы ({reviews.length})</h2>
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{review.User?.firstName} {review.User?.lastName}</p>
                <p className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Событие</p>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">{review.eventRating}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Продавец</p>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">{review.sellerRating}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Затем в return, после SellerEvents добавьте:
// <EventReviews eventId={event.id} />
