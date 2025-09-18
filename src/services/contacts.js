import { Contact } from '../models/contacts.js';
import createError from 'http-errors';
import mongoose from 'mongoose';

export async function getAllContacts() {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    throw error;
  }
}

export async function getContactById(contactId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID format');
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw createError(404, 'Contact not found');
    }
    return contact;
  } catch (error) {
    throw error;
  }
}

export async function createContact(contactData) {
  try {
    const contact = new Contact(contactData);
    await contact.save();
    return contact;
  } catch (error) {
    throw error;
  }
}

export async function updateContact(contactId, updateData) {
  try {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID format');
    }

    const contact = await Contact.findByIdAndUpdate(contactId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      throw createError(404, 'Contact not found');
    }

    return contact;
  } catch (error) {
    throw error;
  }
}

export async function deleteContact(contactId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID format');
    }

    const contact = await Contact.findByIdAndDelete(contactId);

    if (!contact) {
      throw createError(404, 'Contact not found');
    }

    return contact;
  } catch (error) {
    throw error;
  }
}
