import pino from 'pino';

// Sensitive data scrubber
const scrubber = {
  // Email masking: user@domain.com -> u***@domain.com
  email: (email: string): string => {
    if (!email || typeof email !== 'string') return email;
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    return `${local.charAt(0)}***@${domain}`;
  },

  // Phone masking: +996700123456 -> +996***3456
  phone: (phone: string): string => {
    if (!phone || typeof phone !== 'string') return phone;
    if (phone.length < 8) return '***';
    return phone.substring(0, 4) + '***' + phone.substring(phone.length - 4);
  },

  // Credit card masking: 1234567890123456 -> 1234***3456
  creditCard: (cc: string): string => {
    if (!cc || typeof cc !== 'string') return cc;
    return cc.substring(0, 4) + '***' + cc.substring(cc.length - 4);
  },
};

// Custom serializer to scrub sensitive data
const customSerializers = {
  req: (req: any) => {
    const scrubbed = { ...req };

    // Scrub request body
    if (scrubbed.body) {
      if (scrubbed.body.email) {
        scrubbed.body.email = scrubber.email(scrubbed.body.email);
      }
      if (scrubbed.body.phone) {
        scrubbed.body.phone = scrubber.phone(scrubbed.body.phone);
      }
      if (scrubbed.body.paymentInfo) {
        scrubbed.body.paymentInfo = '[REDACTED]';
      }
    }

    // Scrub query parameters
    if (scrubbed.query && scrubbed.query.email) {
      scrubbed.query.email = scrubber.email(scrubbed.query.email);
    }

    return scrubbed;
  },

  res: pino.stdSerializers.res,
  err: pino.stdSerializers.err,
};

export const logger = pino({
  serializers: customSerializers,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.paymentInfo',
      'req.body.creditCard',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
