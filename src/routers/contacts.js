import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import isValidId from '../middlewares/isValidId.js';
import validateBody from '../middlewares/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../schemas/contacts.js';
import authenticate from '../middlewares/authenticate.js';
import { uploadPhoto } from '../middlewares/upload.js';

const router = express.Router();

// Застосовуємо аутентифікацію до всіх роутів
router.use(authenticate);

router.get('/', ctrlWrapper(getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));
router.post(
  '/',
  uploadPhoto,
  validateBody(createContactSchema),
  ctrlWrapper(createContact),
);
router.patch(
  '/:contactId',
  isValidId,
  uploadPhoto,
  validateBody(updateContactSchema),
  ctrlWrapper(updateContact),
);
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
