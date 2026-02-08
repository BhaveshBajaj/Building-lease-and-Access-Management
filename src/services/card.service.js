const cardRepository = require('../repositories/card.repository');
const employeeRepository = require('../repositories/employee.repository');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class CardService {
  async createCard(cardData) {
    // Validate employee exists
    const employee = await employeeRepository.findById(cardData.employee_id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // Check if employee already has a card
    const existingCard = await cardRepository.findByEmployee(cardData.employee_id);
    if (existingCard) {
      throw new ConflictError('Employee already has an access card');
    }

    // Check if card UID is already in use
    const cardByUid = await cardRepository.findByUid(cardData.card_uid);
    if (cardByUid) {
      throw new ConflictError('Card UID already exists');
    }

    return cardRepository.create(cardData);
  }

  async getCardByUid(cardUid) {
    const card = await cardRepository.findByUid(cardUid);
    if (!card) {
      throw new NotFoundError('Access card not found');
    }
    return card;
  }

  async getCardById(id) {
    return cardRepository.findById(id);
  }

  async getCardByEmployee(employeeId) {
    const card = await cardRepository.findByEmployee(employeeId);
    if (!card) {
      throw new NotFoundError('No access card found for this employee');
    }
    return card;
  }

  async getCards(filters = {}) {
    return cardRepository.findAll(filters);
  }

  async updateCard(id, updates) {
    // If updating card_uid, check it's not already in use
    if (updates.card_uid) {
      const existingCard = await cardRepository.findByUid(updates.card_uid);
      if (existingCard && existingCard.id !== id) {
        throw new ConflictError('Card UID already exists');
      }
    }

    return cardRepository.update(id, updates);
  }

  async updateCardByUid(cardUid, updates) {
    return cardRepository.updateByUid(cardUid, updates);
  }

  async deactivateCard(id) {
    return cardRepository.update(id, { status: 'INACTIVE' });
  }

  async blockCard(id) {
    return cardRepository.update(id, { status: 'BLOCKED' });
  }

  async reportLostCard(id) {
    return cardRepository.update(id, { status: 'LOST' });
  }

  async deleteCard(id) {
    return cardRepository.delete(id);
  }
}

module.exports = new CardService();
