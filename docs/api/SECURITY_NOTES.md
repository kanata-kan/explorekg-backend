# 🛡️ Security Notes

## 🎯 نظرة عامة

ملاحظات وإرشادات أمنية مهمة لاستخدام ExploreKG API.

---

## 🔐 Security Features

### 1. Authentication & Authorization

- ✅ **Session-based** for guests (httpOnly cookies)
- ✅ **JWT-based** for admins (Bearer tokens)
- ✅ **RBAC System** (Role-Based Access Control)
- ✅ **Ownership Validation** لحماية بيانات الضيوف

### 2. Data Protection

- ✅ **Encryption at Rest** (MongoDB field-level encryption)
- ✅ **Password Hashing** (bcrypt with cost factor 12)
- ✅ **Sensitive Data Masking** in logs and responses
- ✅ **HTTPS Only** in production

### 3. Attack Prevention

- ✅ **SQL Injection Protection** (MongoDB + validation)
- ✅ **XSS Protection** (httpOnly cookies, content sanitization)
- ✅ **CSRF Protection** (SameSite cookies)
- ✅ **Rate Limiting** (per IP and per user)
- ✅ **Input Validation** (Zod schemas)

### 4. Monitoring & Logging

- ✅ **Audit Logging** (all admin actions)
- ✅ **Security Event Tracking**
- ✅ **Real-time Alerts** for suspicious activity
- ✅ **Request Logging** (with PII masking)

---

## ⚠️ Important Security Notes

### For Frontend Developers

#### ✅ DO:

1. **Use HTTPS in production**

   ```javascript
   const API_URL =
     process.env.NODE_ENV === 'production'
       ? 'https://api.explorekg.com'
       : 'http://localhost:5000';
   ```

2. **Always include credentials for cookies**

   ```javascript
   fetch('/api/v1/bookings', {
     credentials: 'include', // Important!
   });
   ```

3. **Handle errors properly**

   ```javascript
   try {
     const response = await fetch('/api/v1/guests/guest_123');
     if (response.status === 403) {
       // Unauthorized access
       redirectToLogin();
     }
   } catch (error) {
     console.error('Request failed:', error);
   }
   ```

4. **Validate input on client-side too**

   ```javascript
   // But never rely only on client-side validation!
   if (!email.includes('@')) {
     showError('Invalid email');
     return;
   }
   ```

5. **Clear sensitive data on logout**
   ```javascript
   function logout() {
     localStorage.removeItem('adminToken');
     sessionStorage.clear();
     // Redirect to login
   }
   ```

#### ❌ DON'T:

1. **Don't store sessionId in localStorage**

   ```javascript
   // ❌ Bad - Vulnerable to XSS
   localStorage.setItem('sessionId', sessionId);

   // ✅ Good - Use cookie (handled by backend)
   // Cookie is httpOnly and secure
   ```

2. **Don't log sensitive data**

   ```javascript
   // ❌ Bad
   console.log('Token:', token);
   console.log('Password:', password);

   // ✅ Good
   console.log('Login successful');
   ```

3. **Don't send sessionId in URL**

   ```javascript
   // ❌ Bad
   fetch(`/api/v1/bookings?sessionId=${sessionId}`);

   // ✅ Good - Use cookie
   fetch('/api/v1/bookings', { credentials: 'include' });
   ```

4. **Don't trust client-side data**

   ```javascript
   // ❌ Bad - Price can be manipulated
   const price = document.getElementById('price').value;

   // ✅ Good - Always calculate price on backend
   const response = await fetch('/api/v1/pack-relations/calculate-price', {
     method: 'POST',
     body: JSON.stringify(selection),
   });
   ```

5. **Don't expose admin tokens**

   ```javascript
   // ❌ Bad
   <div data-token={adminToken}>Admin Panel</div>

   // ✅ Good - Keep token in memory or httpOnly cookie
   ```

---

### For Backend Developers

#### ✅ DO:

1. **Validate all inputs**

   ```typescript
   // Using Zod
   const schema = z.object({
     email: z.string().email(),
     phoneNumber: z.string().regex(/^\+996\d{9}$/),
   });
   ```

2. **Use parameterized queries**

   ```typescript
   // ✅ Good - MongoDB queries are safe
   await Guest.findOne({ sessionId: req.params.sessionId });
   ```

3. **Hash passwords properly**

   ```typescript
   import bcrypt from 'bcrypt';
   const hashedPassword = await bcrypt.hash(password, 12);
   ```

4. **Implement rate limiting**

   ```typescript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });
   app.use('/api/v1/admin/login', limiter);
   ```

5. **Log security events**
   ```typescript
   import { auditLog } from '../security';
   auditLog(AuditAction.LOGIN, { adminId, success: true });
   ```

#### ❌ DON'T:

1. **Don't return sensitive data**

   ```typescript
   // ❌ Bad
   res.json({ admin: { ...admin, password: admin.password } });

   // ✅ Good
   const { password, ...adminData } = admin;
   res.json({ admin: adminData });
   ```

2. **Don't use plain text passwords**

   ```typescript
   // ❌ Bad
   if (password === admin.password) { ... }

   // ✅ Good
   const isValid = await bcrypt.compare(password, admin.password);
   ```

3. **Don't expose error details in production**

   ```typescript
   // ❌ Bad
   res.status(500).json({ error: error.stack });

   // ✅ Good
   if (process.env.NODE_ENV === 'production') {
     res.status(500).json({ error: 'Internal server error' });
   } else {
     res.status(500).json({ error: error.message });
   }
   ```

---

## 🚨 Common Security Threats & Prevention

### 1. SQL Injection

**Threat:** Malicious SQL queries in input  
**Prevention:**

- ✅ Using MongoDB (NoSQL) with proper validation
- ✅ Zod schema validation
- ✅ Never use string interpolation for queries

### 2. XSS (Cross-Site Scripting)

**Threat:** Injecting malicious scripts  
**Prevention:**

- ✅ HttpOnly cookies (can't be accessed by JavaScript)
- ✅ Input sanitization
- ✅ Content Security Policy headers
- ✅ Escape output in templates

### 3. CSRF (Cross-Site Request Forgery)

**Threat:** Unauthorized requests from other sites  
**Prevention:**

- ✅ SameSite cookie attribute
- ✅ Origin header verification
- ✅ CORS configuration

### 4. Brute Force Attacks

**Threat:** Multiple login attempts  
**Prevention:**

- ✅ Rate limiting on login endpoint
- ✅ Account lockout after failed attempts
- ✅ CAPTCHA (future enhancement)

### 5. Session Hijacking

**Threat:** Stealing session IDs  
**Prevention:**

- ✅ HttpOnly + Secure cookies
- ✅ Session expiration (7 days)
- ✅ HTTPS only in production
- ✅ Session rotation on sensitive actions

---

## 🔒 HTTPS Configuration

### Production Setup

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name api.explorekg.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.explorekg.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Security Monitoring

### Endpoints للمراقبة

```http
GET /api/v1/security/status
Authorization: Bearer {admin_token}
```

### Real-time Alerts

النظام يرسل تنبيهات عند:

- ⚠️ محاولات تسجيل دخول فاشلة متكررة
- ⚠️ هجمات SQL Injection أو XSS
- ⚠️ تجاوز معدل الطلبات (Rate Limit)
- ⚠️ محاولات الوصول غير المصرح بها
- ⚠️ أخطاء النظام الحرجة

---

## 🎓 Security Checklist

### Before Deployment

- [ ] تفعيل HTTPS
- [ ] تحديث جميع Dependencies
- [ ] مراجعة Environment Variables
- [ ] اختبار جميع Authentication flows
- [ ] تفعيل Rate Limiting
- [ ] مراجعة CORS settings
- [ ] تفعيل Security Headers
- [ ] اختبار Error Handling
- [ ] مراجعة Audit Logs
- [ ] Backup استراتيجية

### Regular Maintenance

- [ ] مراجعة Audit Logs أسبوعياً
- [ ] تحديث Dependencies شهرياً
- [ ] مراجعة Security Alerts
- [ ] اختبار Backup Recovery
- [ ] تحديث SSL Certificates

---

## 📞 Security Incident Response

### في حالة اكتشاف ثغرة أمنية:

1. **لا تفصح عنها علناً**
2. **اتصل بـSUPER_ADMIN فوراً**
3. **وثّق التفاصيل:**
   - نوع الثغرة
   - كيفية اكتشافها
   - الخطوات لإعادة الإنتاج
   - التأثير المحتمل

4. **البريد الإلكتروني:**
   security@explorekg.com

---

## 🔗 مصادر إضافية

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Best Practices](../../security/)
- [Audit Logs Documentation](../../reports/)

---

**آخر تحديث:** November 3, 2025  
**الإصدار:** v1.3.0
