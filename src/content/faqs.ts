import { business } from '@/content/business'
import type { Faq } from '@/types/content'

const { address } = business

/**
 * Homepage FAQ, and the source for FAQPage JSON-LD in Phase 6.
 *
 * Every answer here is derived from a confirmed fact in §4. The questions a
 * customer most wants answered — what a chip repair costs, whether ADAS
 * recalibration is done in-house, which insurers are direct-billed, how far
 * mobile service travels — are all open items (§4.1-4.7) and are deliberately
 * absent rather than guessed at. They should be added the moment the client
 * confirms them; they are the highest-value content on the page.
 */
export const faqs: readonly Faq[] = [
  {
    id: 'where',
    question: 'Where are you located?',
    answer: `${address.street}, ${address.city}, ${address.region} ${address.postalCode}.`,
  },
  {
    id: 'hours',
    question: 'When are you open?',
    answer: 'Monday to Friday, 8:00am to 5:00pm. We are closed Saturday and Sunday.',
  },
  {
    id: 'quote',
    question: 'How do I get a price?',
    answer:
      `Send a quote request with your vehicle and the damage, or call ${business.phone} during opening hours. ` +
      'Glass pricing depends on the vehicle, the type of glass and what the job involves, so we quote each one rather than publishing a list.',
  },
  {
    id: 'payment',
    question: 'What payment do you take?',
    answer: `${business.payment.join(', ')}.`,
  },
  {
    id: 'vehicles',
    question: 'Do you work on anything other than cars?',
    answer:
      'Yes. As well as cars and trucks we do glass for boats, RVs and motorhomes, and for heavy equipment and farm machinery.',
  },
  {
    id: 'history',
    question: 'How long have you been in business?',
    answer: `Since ${business.founded.year}. ${business.founded.founder} started the shop, and his son ${business.founded.currentOwner} runs it today.`,
  },
] as const
