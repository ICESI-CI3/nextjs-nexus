/**
 * Ticket Service
 * Handles all API calls related to ticket operations
 */

import { post } from '@/src/lib/apiClient';
import type { Ticket } from '@/src/lib/types';

/**
 * Validate a ticket by its code
 * @param ticketCode - The ticket code to validate
 * @returns The validated ticket data
 */
export const validateTicket = async (ticketCode: string): Promise<Ticket> => {
  const response = await post<Ticket>(`/tickets/validate/${ticketCode}`, {});
  return response;
};

const ticketService = {
  validateTicket,
};

export default ticketService;
