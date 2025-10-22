import express from 'express';
import cors from 'cors';
import pino from 'pino';
import cookieParser from 'cookie-parser';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import apiDocsRouter from './routers/api-docs.js';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

export function setupServer() {
  const app = express();

  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://nodejs-hw-mongodb-9ho9.onrender.com',
      ];

      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      environment: process.env.NODE_ENV,
    });
    next();
  });

  app.use('/api-docs', apiDocsRouter);

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
