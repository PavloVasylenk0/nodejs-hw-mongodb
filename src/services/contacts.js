import { Contact } from '../models/contacts.js';
import createError from 'http-errors';
import mongoose from 'mongoose';

export async function getAllContacts(queryParams = {}) {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      type,
      isFavourite,
    } = queryParams;

    const filter = {};

    if (type) {
      filter.contactType = type;
    }

    if (isFavourite !== undefined) {
      filter.isFavourite = isFavourite === 'true';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(perPage);
    const limit = parseInt(perPage);

    const [contacts, totalItems] = await Promise.all([
      Contact.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = parseInt(page);

    return {
      data: contacts,
      page: currentPage,
      perPage: limit,
      totalItems,
      totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
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
