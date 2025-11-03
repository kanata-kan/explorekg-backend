# 📝 Booking System Integration

**دليل تكامل نظام الحجوزات للفريق Frontend**

---

## 📋 نظرة عامة

نظام Booking يدير دورة حياة الحجوزات الكاملة من الإنشاء إلى التأكيد والإلغاء، مع دعم أنواع متعددة من العناصر القابلة للحجز.

---

## 🎯 Booking Endpoints

### إنشاء حجز جديد

```typescript
POST / api / v1 / bookings;

interface CreateBookingRequest {
  guestId: string;
  item: {
    type: 'travel_pack' | 'activity' | 'car';
    id: string;
    customSelections?: {
      activities?: Array<{
        localeGroupId: string;
        quantity: number;
      }>;
      car?: {
        localeGroupId: string;
        durationDays: number;
      };
    };
  };
  bookingDetails: {
    startDate: string; // ISO date
    endDate: string; // ISO date
    participants: number;
    specialRequests?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: string;
  };
  locale: 'en' | 'fr';
}

// Usage Example
const booking = await fetch('/api/v1/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guestId: 'guest-session-id',
    item: {
      type: 'travel_pack',
      id: 'pack-desert-adventure',
      customSelections: {
        activities: [
          { localeGroupId: 'quad-biking', quantity: 2 },
          { localeGroupId: 'camel-riding', quantity: 2 },
        ],
        car: {
          localeGroupId: 'suv-4x4',
          durationDays: 3,
        },
      },
    },
    bookingDetails: {
      startDate: '2024-12-15',
      endDate: '2024-12-18',
      participants: 2,
      specialRequests: 'Vegetarian meals',
    },
    contactInfo: {
      email: 'user@example.com',
      phone: '+123456789',
      emergencyContact: '+987654321',
    },
    locale: 'en',
  }),
});
```

### الحصول على الحجز برقم الحجز

```typescript
GET /api/v1/bookings/:bookingNumber

// Usage
const booking = await fetch(`/api/v1/bookings/BK-001`);
```

### الحصول على حجوزات الضيف

```typescript
GET /api/v1/bookings/guest/:guestId

// Usage
const guestBookings = await fetch(`/api/v1/bookings/guest/${guestId}`);
```

### تحديث حالة الحجز

```typescript
PATCH /api/v1/bookings/:bookingNumber/status

interface UpdateBookingStatusRequest {
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  paymentStatus?: 'unpaid' | 'paid' | 'refunded' | 'failed';
  payment?: {
    method: string;
    transactionId: string;
    amount: number;
    currency: string;
  };
}

// Usage
const updatedBooking = await fetch(`/api/v1/bookings/BK-001/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'confirmed',
    paymentStatus: 'paid',
    payment: {
      method: 'credit_card',
      transactionId: 'tx_123456',
      amount: 500,
      currency: 'USD'
    }
  })
});
```

### إلغاء الحجز

```typescript
PATCH /api/v1/bookings/:bookingNumber/cancel

interface CancelBookingRequest {
  reason?: string;
  refundRequested?: boolean;
}

// Usage
const cancelledBooking = await fetch(`/api/v1/bookings/BK-001/cancel`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: 'Change of plans',
    refundRequested: true
  })
});
```

---

## 🪝 Booking Hooks

### useBooking Hook

```typescript
// hooks/useBooking.ts
export function useBooking(bookingNumber?: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async (number: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await BookingService.getBooking(number);
      setBooking(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (data: CreateBookingRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await BookingService.createBooking(data);
      setBooking(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (
    number: string,
    data: UpdateBookingStatusRequest
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await BookingService.updateBookingStatus(number, data);
      setBooking(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (number: string, data: CancelBookingRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await BookingService.cancelBooking(number, data);
      setBooking(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingNumber) {
      fetchBooking(bookingNumber);
    }
  }, [bookingNumber]);

  return {
    booking,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    refetch: bookingNumber ? () => fetchBooking(bookingNumber) : undefined,
  };
}
```

### useGuestBookings Hook

```typescript
// hooks/useGuestBookings.ts
export function useGuestBookings(guestId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuestBookings = async () => {
    if (!guestId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await BookingService.getGuestBookings(guestId);
      setBookings(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestBookings();
  }, [guestId]);

  const getBookingsByStatus = (status: BookingStatus) => {
    return bookings.filter(booking => booking.status === status);
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const startDate = new Date(booking.bookingDetails.startDate);
      return startDate > now && booking.status === 'confirmed';
    });
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchGuestBookings,
    getBookingsByStatus,
    getUpcomingBookings,
  };
}
```

---

## 🎨 Booking Components

### Booking Form

```typescript
// components/booking/BookingForm.tsx
interface BookingFormProps {
  packId: string;
  guestId: string;
  onSuccess: (booking: Booking) => void;
  initialData?: Partial<CreateBookingRequest>;
}

export function BookingForm({ packId, guestId, onSuccess, initialData }: BookingFormProps) {
  const [formData, setFormData] = useState<CreateBookingRequest>({
    guestId,
    item: {
      type: 'travel_pack',
      id: packId,
      customSelections: {
        activities: [],
        car: null,
      },
    },
    bookingDetails: {
      startDate: '',
      endDate: '',
      participants: 1,
      specialRequests: '',
    },
    contactInfo: {
      email: '',
      phone: '',
      emergencyContact: '',
    },
    locale: 'en',
    ...initialData,
  });

  const [selectedActivities, setSelectedActivities] = useState<Array<{
    localeGroupId: string;
    name: string;
    quantity: number;
    price: number;
  }>>([]);

  const [selectedCar, setSelectedCar] = useState<{
    localeGroupId: string;
    name: string;
    durationDays: number;
    pricePerDay: number;
  } | null>(null);

  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);

  const { createBooking, loading, error } = useBooking();

  // Calculate pricing when selections change
  useEffect(() => {
    if (selectedActivities.length > 0 || selectedCar) {
      calculatePricing();
    }
  }, [selectedActivities, selectedCar]);

  const calculatePricing = async () => {
    try {
      const result = await PackRelationService.calculatePrice({
        travelPackLocaleGroupId: packId,
        selectedActivities: selectedActivities.map(a => ({
          localeGroupId: a.localeGroupId,
          quantity: a.quantity,
        })),
        selectedCar: selectedCar ? {
          localeGroupId: selectedCar.localeGroupId,
          durationDays: selectedCar.durationDays,
        } : null,
        locale: formData.locale,
      });

      setPricing(result.breakdown);
    } catch (err) {
      console.error('Failed to calculate pricing:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookingData = {
      ...formData,
      item: {
        ...formData.item,
        customSelections: {
          activities: selectedActivities.map(a => ({
            localeGroupId: a.localeGroupId,
            quantity: a.quantity,
          })),
          car: selectedCar ? {
            localeGroupId: selectedCar.localeGroupId,
            durationDays: selectedCar.durationDays,
          } : undefined,
        },
      },
    };

    try {
      const booking = await createBooking(bookingData);
      onSuccess(booking);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      {/* Booking Details Section */}
      <section className="booking-details">
        <h3>Booking Details</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={formData.bookingDetails.startDate}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bookingDetails: {
                  ...prev.bookingDetails,
                  startDate: e.target.value,
                },
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={formData.bookingDetails.endDate}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bookingDetails: {
                  ...prev.bookingDetails,
                  endDate: e.target.value,
                },
              }))}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="participants">Number of Participants</label>
          <input
            id="participants"
            type="number"
            min="1"
            max="20"
            value={formData.bookingDetails.participants}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              bookingDetails: {
                ...prev.bookingDetails,
                participants: parseInt(e.target.value),
              },
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialRequests">Special Requests</label>
          <textarea
            id="specialRequests"
            rows={3}
            value={formData.bookingDetails.specialRequests}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              bookingDetails: {
                ...prev.bookingDetails,
                specialRequests: e.target.value,
              },
            }))}
            placeholder="Any special requirements or requests..."
          />
        </div>
      </section>

      {/* Activity Selection */}
      <section className="activity-selection">
        <h3>Select Activities</h3>
        <ActivitySelector
          packId={packId}
          selectedActivities={selectedActivities}
          onSelectionChange={setSelectedActivities}
          locale={formData.locale}
        />
      </section>

      {/* Car Selection */}
      <section className="car-selection">
        <h3>Transportation</h3>
        <CarSelector
          packId={packId}
          selectedCar={selectedCar}
          onSelectionChange={setSelectedCar}
          locale={formData.locale}
        />
      </section>

      {/* Contact Information */}
      <section className="contact-info">
        <h3>Contact Information</h3>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.contactInfo.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: {
                ...prev.contactInfo,
                email: e.target.value,
              },
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={formData.contactInfo.phone}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: {
                ...prev.contactInfo,
                phone: e.target.value,
              },
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="emergencyContact">Emergency Contact</label>
          <input
            id="emergencyContact"
            type="tel"
            value={formData.contactInfo.emergencyContact}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: {
                ...prev.contactInfo,
                emergencyContact: e.target.value,
              },
            }))}
            placeholder="Emergency contact number"
          />
        </div>
      </section>

      {/* Pricing Summary */}
      {pricing && (
        <section className="pricing-summary">
          <h3>Pricing Summary</h3>
          <PricingBreakdownDisplay pricing={pricing} />
        </section>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-large"
      >
        {loading ? 'Creating Booking...' : `Book Now - $${pricing?.total || 0}`}
      </button>
    </form>
  );
}
```

### Booking Card

```typescript
// components/booking/BookingCard.tsx
interface BookingCardProps {
  booking: Booking;
  locale: 'en' | 'fr';
  onViewDetails: (bookingNumber: string) => void;
  onCancel?: (bookingNumber: string) => void;
}

export function BookingCard({ booking, locale, onViewDetails, onCancel }: BookingCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(
      locale === 'fr' ? 'fr-FR' : 'en-US',
      { style: 'currency', currency }
    ).format(amount);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  const canCancel = () => {
    const startDate = new Date(booking.bookingDetails.startDate);
    const now = new Date();
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return booking.status === 'confirmed' && daysUntilStart > 7;
  };

  return (
    <div className="booking-card">
      <div className="booking-header">
        <div className="booking-number">
          <strong>{booking.bookingNumber}</strong>
        </div>
        <div className={`booking-status status-${getStatusColor(booking.status)}`}>
          {booking.status.toUpperCase()}
        </div>
      </div>

      <div className="booking-content">
        <h4 className="booking-title">
          {booking.itemSnapshot.title}
        </h4>

        <div className="booking-details-grid">
          <div className="detail-item">
            <span className="label">📅 Dates:</span>
            <span className="value">
              {formatDate(booking.bookingDetails.startDate)} - {formatDate(booking.bookingDetails.endDate)}
            </span>
          </div>

          <div className="detail-item">
            <span className="label">👥 Participants:</span>
            <span className="value">{booking.bookingDetails.participants}</span>
          </div>

          <div className="detail-item">
            <span className="label">💰 Total:</span>
            <span className="value">
              {formatPrice(booking.pricing.total, booking.pricing.currency)}
            </span>
          </div>

          <div className="detail-item">
            <span className="label">💳 Payment:</span>
            <span className={`value payment-${booking.paymentStatus}`}>
              {booking.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {booking.bookingDetails.specialRequests && (
          <div className="special-requests">
            <span className="label">Special Requests:</span>
            <p>{booking.bookingDetails.specialRequests}</p>
          </div>
        )}

        {/* Custom Selections Display */}
        {booking.itemSnapshot.customSelections && (
          <div className="custom-selections">
            {booking.itemSnapshot.customSelections.activities && (
              <div className="selected-activities">
                <h5>Selected Activities:</h5>
                <ul>
                  {booking.itemSnapshot.customSelections.activities.map((activity, index) => (
                    <li key={index}>
                      {activity.name} x{activity.quantity}
                      {activity.discount > 0 && (
                        <span className="discount">({activity.discount}% off)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {booking.itemSnapshot.customSelections.car && (
              <div className="selected-car">
                <h5>Transportation:</h5>
                <p>
                  {booking.itemSnapshot.customSelections.car.name}
                  ({booking.itemSnapshot.customSelections.car.durationDays} days)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="booking-actions">
        <button
          onClick={() => onViewDetails(booking.bookingNumber)}
          className="btn btn-outline"
        >
          View Details
        </button>

        {canCancel() && onCancel && (
          <button
            onClick={() => onCancel(booking.bookingNumber)}
            className="btn btn-danger"
          >
            Cancel Booking
          </button>
        )}

        {booking.status === 'pending' && booking.paymentStatus === 'unpaid' && (
          <button className="btn btn-primary">
            Complete Payment
          </button>
        )}
      </div>
    </div>
  );
}
```

### Booking Details Page

```typescript
// components/booking/BookingDetailsPage.tsx
interface BookingDetailsPageProps {
  bookingNumber: string;
  locale: 'en' | 'fr';
}

export function BookingDetailsPage({ bookingNumber, locale }: BookingDetailsPageProps) {
  const { booking, loading, error, updateBookingStatus, cancelBooking } = useBooking(bookingNumber);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Error Loading Booking</h2>
        <p>{error}</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="not-found">
        <h2>Booking Not Found</h2>
        <p>Booking {bookingNumber} could not be found.</p>
      </div>
    );
  }

  const handleCancelBooking = async (reason: string) => {
    try {
      await cancelBooking(bookingNumber, {
        reason,
        refundRequested: true
      });
      setShowCancelModal(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="booking-details-page">
      <div className="page-header">
        <h1>Booking Details</h1>
        <div className="booking-number-display">
          {booking.bookingNumber}
        </div>
      </div>

      <div className="booking-overview">
        <BookingCard
          booking={booking}
          locale={locale}
          onViewDetails={() => {}}
          onCancel={() => setShowCancelModal(true)}
        />
      </div>

      {/* Detailed Information Sections */}
      <div className="booking-sections">
        {/* Contact Information */}
        <section className="contact-section">
          <h3>Contact Information</h3>
          <div className="contact-grid">
            <div className="contact-item">
              <span className="label">Email:</span>
              <span className="value">{booking.contactInfo.email}</span>
            </div>
            <div className="contact-item">
              <span className="label">Phone:</span>
              <span className="value">{booking.contactInfo.phone}</span>
            </div>
            {booking.contactInfo.emergencyContact && (
              <div className="contact-item">
                <span className="label">Emergency Contact:</span>
                <span className="value">{booking.contactInfo.emergencyContact}</span>
              </div>
            )}
          </div>
        </section>

        {/* Payment Information */}
        {booking.payment && (
          <section className="payment-section">
            <h3>Payment Information</h3>
            <div className="payment-grid">
              <div className="payment-item">
                <span className="label">Method:</span>
                <span className="value">{booking.payment.method}</span>
              </div>
              <div className="payment-item">
                <span className="label">Transaction ID:</span>
                <span className="value">{booking.payment.transactionId}</span>
              </div>
              <div className="payment-item">
                <span className="label">Amount:</span>
                <span className="value">
                  {booking.payment.amount} {booking.payment.currency}
                </span>
              </div>
              {booking.payment.paidAt && (
                <div className="payment-item">
                  <span className="label">Paid At:</span>
                  <span className="value">
                    {new Date(booking.payment.paidAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Pricing Breakdown */}
        <section className="pricing-section">
          <h3>Pricing Breakdown</h3>
          <PricingBreakdownDisplay pricing={booking.pricing} />
        </section>

        {/* Booking Timeline */}
        <section className="timeline-section">
          <h3>Booking Timeline</h3>
          <BookingTimeline booking={booking} />
        </section>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <CancelBookingModal
          booking={booking}
          onCancel={handleCancelBooking}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}
```

---

## 🚨 Error Handling

### Booking-Specific Errors

```typescript
// utils/bookingErrors.ts
export function handleBookingError(error: ApiError): string {
  switch (error.statusCode) {
    case 400:
      if (error.message.includes('guestId')) {
        return 'Invalid guest session. Please refresh and try again';
      }
      if (error.message.includes('date')) {
        return 'Please select valid dates for your booking';
      }
      if (error.message.includes('participants')) {
        return 'Invalid number of participants';
      }
      return 'Please check your booking details';

    case 404:
      if (error.message.includes('pack')) {
        return 'Travel pack not found';
      }
      if (error.message.includes('booking')) {
        return 'Booking not found';
      }
      return 'Requested resource not found';

    case 409:
      return 'This booking conflicts with existing reservations';

    case 410:
      return 'Booking has expired and cannot be modified';

    case 422:
      return 'Booking validation failed. Please check all required fields';

    case 429:
      return 'Too many booking attempts. Please wait and try again';

    default:
      return 'Unable to process booking. Please try again';
  }
}
```

---

## 🧪 Testing

### Booking Flow Integration Test

```typescript
// __tests__/integration/bookingFlow.test.tsx
describe('Booking Flow Integration', () => {
  it('should complete full booking flow', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();

    render(
      <BookingForm
        packId="pack-1"
        guestId="guest-1"
        onSuccess={mockOnSuccess}
      />
    );

    // Fill booking details
    await user.type(screen.getByLabelText(/start date/i), '2024-12-15');
    await user.type(screen.getByLabelText(/end date/i), '2024-12-18');
    await user.type(screen.getByLabelText(/participants/i), '2');

    // Fill contact info
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+123456789');

    // Submit booking
    await user.click(screen.getByRole('button', { name: /book now/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingNumber: expect.stringMatching(/^BK-/),
          status: 'pending',
        })
      );
    });
  });
});
```

---

## 📋 Best Practices

### ✅ Booking Management

- Validate dates and participant counts
- Show pricing breakdown clearly
- Handle booking conflicts gracefully
- Implement proper cancellation policies
- Send confirmation emails

### ✅ User Experience

- Show progress through booking steps
- Provide clear booking summaries
- Enable easy modification/cancellation
- Display booking status prominently
- Offer customer support contact

### ✅ Data Handling

- Store booking snapshots immutably
- Track all status changes
- Implement proper timeout handling
- Validate against availability
- Handle payment processing securely

---

**🔗 Related Guides:**

- [Guest System Integration](./guest-integration.md)
- [Travel Packs Integration](./travel-packs-integration.md)
- [API Quick Reference](./api-quick-reference.md)
