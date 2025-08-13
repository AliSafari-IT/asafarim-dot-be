/**
 * Contact API service for handling contact form submissions using EmailJS
 */
import emailjs from '@emailjs/browser';

export interface ContactRequest {
  email: string;
  subject?: string;
  message: string;
  name: string;
  from_name?: string;
  reply_to?: string;
}

export interface ContactResponse {
  status: number;
  text: string;
}

// EmailJS configuration from environment variables
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Sends a contact form submission using EmailJS
 * @param data Contact form data
 * @returns Promise with the EmailJS response
 */
export async function submitContactForm(data: ContactRequest): Promise<ContactResponse> {
  try {
    // Prepare the template parameters
    const templateParams = {
      from_name: data.name || data.from_name,
      reply_to: data.email || data.reply_to,
      subject: data.subject || 'Website Contact',
      message: data.message,
    };

    // Send the email using EmailJS
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
}

/**
 * Initialize EmailJS
 * Should be called once when the application starts
 */
export function initEmailJS(): void {
  emailjs.init(PUBLIC_KEY);
}
