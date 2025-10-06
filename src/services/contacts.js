import { Contact } from '../models/contacts.js';
import createError from 'http-errors';
import mongoose from 'mongoose';

export async function getAllContacts(queryParams = {}, userId) {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      type,
      isFavourite,
    } = queryParams;

    // Побудова фільтра з userId
    const filter = { userId };

    if (type) {
      filter.contactType = type;
    }

    if (isFavourite !== undefined) {
      filter.isFavourite = isFavourite === 'true';
    }

    // Побудова об'єкта сортування
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Розрахунок пагінації
    const skip = (parseInt(page) - 1) * parseInt(perPage);
    const limit = parseInt(perPage);

    // Виконання запиту
    const [contacts, totalItems] = await Promise.all([
      Contact.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);

    // Розрахунок метаданих пагінації
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

export async function getContactById(contactId, userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID format');
    }

    const contact = await Contact.findOne({ _id: contactId, userId });
    if (!contact) {
      throw createError(404, 'Contact not found');
    }
    return contact;
  } catch (error) {
    throw error;
  }
}

export async function createContact(contactData, userId) {
  try {
    const contactWithUserId = {
      ...contactData,
      userId: userId,
    };

    const contact = new Contact(contactWithUserId);
    await contact.save();
    return contact;
  } catch (error) {
    throw error;
  }
}

export async function updateContact(contactId, updateData, userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID format');
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, userId },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!contact) {
      throw createError(404, 'Contact not found');
    }

    return contact;
  } catch (error) {
    throw error;
  }
}

export async function deleteContact(contactId, userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw createError(400, 'Invalid contact ID format');
    }

    const contact = await Contact.findOneAndDelete({ _id: contactId, userId });

    if (!contact) {
      throw createError(404, 'Contact not found');
    }

    return contact;
  } catch (error) {
    throw error;
  }
}
