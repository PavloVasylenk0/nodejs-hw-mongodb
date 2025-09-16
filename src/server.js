import express from 'express';
import cors from 'cors';
import pino from 'pino';
import mongoose from 'mongoose';
import { getAllContacts, getContactById } from './services/contacts.js';

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

  app.use(cors());
  app.use(express.json());


  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });


  app.get('/contacts', async (req, res, next) => {
    try {
      const contacts = await getAllContacts();

      res.status(200).json({
        status: 200,
        message: 'Successfully found contacts!',
        data: contacts,
      });
    } catch (error) {
      next(error);
    }
  });


  app.get('/contacts/:contactId', async (req, res, next) => {
    try {
      const { contactId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(contactId)) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      const contact = await getContactById(contactId);

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  });


  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });


  app.use((error, req, res, next) => {
    logger.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  });

  return app;
}
