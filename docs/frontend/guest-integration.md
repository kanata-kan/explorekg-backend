# 🏠 Guest System Integration

**دليل تكامل نظام الضيوف للفريق Frontend**

---

## 📋 نظرة عامة

نظام Guest يدير هويات الزوار المؤقتين قبل التسجيل الكامل، مما يسمح للمستخدمين بتصفح وحجز الخدمات دون إنشاء حساب دائم.

---

## 🎯 Guest Endpoints

### إنشاء ضيف جديد

```typescript
POST / api / v1 / guests;

interface CreateGuestRequest {
  email: string;
  fullName: string;
  phone: string;
  locale: 'en' | 'fr';
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    source?: string;
  };
}

// Usage
const guest = await fetch('/api/v1/guests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    fullName: 'John Doe',
    phone: '+123456789',
    locale: 'en',
  }),
});
```

### الحصول على بيانات الضيف

```typescript
GET /api/v1/guests/:sessionId

// Usage
const guest = await fetch(`/api/v1/guests/${sessionId}`);
```

### تحديث بيانات الضيف

```typescript
PATCH /api/v1/guests/:sessionId

// Usage
const updatedGuest = await fetch(`/api/v1/guests/${sessionId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Updated Name',
    locale: 'fr'
  })
});
```

---

## 🪝 Guest Hook

```typescript
// hooks/useGuest.ts
export function useGuest(sessionId?: string) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGuest = async (data: CreateGuestRequest) => {
    setLoading(true);
    try {
      const response = await GuestService.createGuest(data);
      setGuest(response);
      localStorage.setItem('guestSessionId', response.sessionId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGuest = async (updates: Partial<Guest>) => {
    if (!guest) return;

    setLoading(true);
    try {
      const response = await GuestService.updateGuest(guest.sessionId, updates);
      setGuest(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchGuest(sessionId);
    }
  }, [sessionId]);

  return { guest, loading, error, createGuest, updateGuest };
}
```

---

## 🎨 Guest Components

### Guest Registration Form

```typescript
// components/GuestRegistrationForm.tsx
export function GuestRegistrationForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState<CreateGuestRequest>({
    email: '',
    fullName: '',
    phone: '',
    locale: 'en',
    metadata: {
      source: 'web',
      userAgent: navigator.userAgent,
    },
  });

  const { createGuest, loading, error } = useGuest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const guest = await createGuest(formData);
      onSuccess(guest);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          fullName: e.target.value
        }))}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          email: e.target.value
        }))}
        required
      />

      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          phone: e.target.value
        }))}
        required
      />

      <select
        value={formData.locale}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          locale: e.target.value as 'en' | 'fr'
        }))}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Guest Session'}
      </button>
    </form>
  );
}
```

### Guest Profile Card

```typescript
// components/GuestProfileCard.tsx
export function GuestProfileCard({ guest, onEdit }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = () => {
    const expiryDate = new Date(guest.expiresAt);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7;
  };

  return (
    <div className="guest-profile-card">
      <div className="profile-header">
        <h3>{guest.fullName}</h3>
        <span className="session-id">Session: {guest.sessionId}</span>
      </div>

      <div className="profile-details">
        <div className="detail-item">
          <span className="label">Email:</span>
          <span className="value">{guest.email}</span>
        </div>

        <div className="detail-item">
          <span className="label">Phone:</span>
          <span className="value">{guest.phone}</span>
        </div>

        <div className="detail-item">
          <span className="label">Language:</span>
          <span className="value">
            {guest.locale === 'en' ? 'English' : 'Français'}
          </span>
        </div>

        <div className="detail-item">
          <span className="label">Created:</span>
          <span className="value">{formatDate(guest.createdAt)}</span>
        </div>

        <div className="detail-item">
          <span className="label">Expires:</span>
          <span className={`value ${isExpiringSoon() ? 'expiring-soon' : ''}`}>
            {formatDate(guest.expiresAt)}
          </span>
        </div>
      </div>

      {isExpiringSoon() && (
        <div className="expiry-warning">
          ⚠️ Your session will expire soon. Consider creating a permanent account.
        </div>
      )}

      <div className="profile-actions">
        <button onClick={onEdit} className="btn btn-secondary">
          Edit Profile
        </button>

        {guest.canMigrate && (
          <button className="btn btn-primary">
            Create Account
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 🌐 Context Provider

```typescript
// contexts/GuestContext.tsx
interface GuestContextType {
  guest: Guest | null;
  loading: boolean;
  error: string | null;
  createGuestSession: (data: CreateGuestRequest) => Promise<Guest>;
  updateGuestProfile: (updates: Partial<Guest>) => Promise<Guest | undefined>;
  clearGuestSession: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const { guest, loading, error, createGuest, updateGuest } = useGuest(sessionId);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('guestSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  const createGuestSession = async (data: CreateGuestRequest) => {
    const newGuest = await createGuest(data);
    setSessionId(newGuest.sessionId);
    return newGuest;
  };

  const clearGuestSession = () => {
    localStorage.removeItem('guestSessionId');
    setSessionId(undefined);
  };

  return (
    <GuestContext.Provider value={{
      guest,
      loading,
      error,
      createGuestSession,
      updateGuestProfile: updateGuest,
      clearGuestSession,
    }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuestContext() {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuestContext must be used within GuestProvider');
  }
  return context;
}
```

---

## 📱 Usage in Pages

### Next.js Page Example

```typescript
// pages/register.tsx
export default function RegisterPage() {
  const router = useRouter();
  const { guest, createGuestSession } = useGuestContext();

  useEffect(() => {
    // Redirect if already has guest session
    if (guest) {
      router.push('/packs');
    }
  }, [guest, router]);

  const handleGuestCreated = (newGuest: Guest) => {
    // Redirect to travel packs
    router.push('/packs');
  };

  return (
    <div className="register-page">
      <h1>Get Started</h1>
      <p>Create a guest session to browse and book travel packages</p>

      <GuestRegistrationForm onSuccess={handleGuestCreated} />

      <div className="benefits">
        <h3>Why create a guest session?</h3>
        <ul>
          <li>Quick booking without full registration</li>
          <li>Save your preferences</li>
          <li>Track your bookings</li>
          <li>Upgrade to full account later</li>
        </ul>
      </div>
    </div>
  );
}
```

### Profile Management Page

```typescript
// pages/profile.tsx
export default function ProfilePage() {
  const { guest, updateGuestProfile } = useGuestContext();
  const [editing, setEditing] = useState(false);

  if (!guest) {
    return <div>Please create a guest session first</div>;
  }

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async (updates: Partial<Guest>) => {
    await updateGuestProfile(updates);
    setEditing(false);
  };

  return (
    <div className="profile-page">
      <h1>Guest Profile</h1>

      {editing ? (
        <GuestEditForm
          guest={guest}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <GuestProfileCard
          guest={guest}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
```

---

## 🚨 Error Handling

### Common Guest Errors

```typescript
// utils/guestErrors.ts
export function handleGuestError(error: ApiError): string {
  switch (error.statusCode) {
    case 400:
      if (error.message.includes('email')) {
        return 'Please provide a valid email address';
      }
      if (error.message.includes('phone')) {
        return 'Please provide a valid phone number';
      }
      return 'Please check your input and try again';

    case 404:
      return 'Guest session not found. Please create a new session';

    case 409:
      return 'This email is already in use';

    case 410:
      return 'Guest session has expired. Please create a new one';

    default:
      return 'Unable to process guest request. Please try again';
  }
}
```

### Session Expiry Handler

```typescript
// utils/sessionManager.ts
export class SessionManager {
  static checkSessionExpiry(guest: Guest): boolean {
    return new Date(guest.expiresAt) <= new Date();
  }

  static getDaysUntilExpiry(guest: Guest): number {
    const expiryDate = new Date(guest.expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static shouldShowExpiryWarning(guest: Guest): boolean {
    return this.getDaysUntilExpiry(guest) <= 7;
  }

  static autoCleanupExpiredSession() {
    const sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) return;

    // Check if we have cached guest data
    const cachedGuest = sessionStorage.getItem('guestData');
    if (cachedGuest) {
      const guest = JSON.parse(cachedGuest);
      if (this.checkSessionExpiry(guest)) {
        localStorage.removeItem('guestSessionId');
        sessionStorage.removeItem('guestData');
        window.location.href = '/register';
      }
    }
  }
}
```

---

## 🧪 Testing

### Guest Service Tests

```typescript
// __tests__/services/guestService.test.ts
describe('GuestService', () => {
  it('should create guest with valid data', async () => {
    const guestData = {
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '+123456789',
      locale: 'en' as const,
    };

    const guest = await GuestService.createGuest(guestData);

    expect(guest).toMatchObject(guestData);
    expect(guest._id).toBeDefined();
    expect(guest.sessionId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('should handle email validation errors', async () => {
    const invalidData = {
      email: 'invalid-email',
      fullName: 'Test User',
      phone: '+123456789',
      locale: 'en' as const,
    };

    await expect(GuestService.createGuest(invalidData)).rejects.toThrow(
      'Please provide a valid email address'
    );
  });
});
```

### Component Tests

```typescript
// __tests__/components/GuestRegistrationForm.test.tsx
describe('GuestRegistrationForm', () => {
  it('should submit form with valid data', async () => {
    const mockOnSuccess = jest.fn();
    render(<GuestRegistrationForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByPlaceholderText('Full Name'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Email'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Phone'), '+123456789');

    await user.click(screen.getByText('Create Guest Session'));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+123456789',
        })
      );
    });
  });
});
```

---

## 📋 Best Practices

### ✅ Session Management

- Store sessionId in localStorage for persistence
- Check session expiry on app load
- Show warning before expiry
- Auto-cleanup expired sessions
- Provide easy upgrade to permanent account

### ✅ Data Validation

- Validate email format client-side
- Check phone number format
- Sanitize all inputs
- Handle validation errors gracefully
- Provide clear error messages

### ✅ User Experience

- Keep registration form simple
- Show benefits of guest session
- Provide easy profile editing
- Display session status clearly
- Offer account upgrade path

### ✅ Security

- Don't store sensitive data in guest sessions
- Implement session timeouts
- Validate all inputs server-side
- Rate limit registration attempts
- Monitor for abuse patterns

---

**🔗 Related Guides:**

- [Booking System Integration](./booking-integration.md)
- [API Quick Reference](./api-quick-reference.md)
- [Error Handling Guide](./error-handling.md)
