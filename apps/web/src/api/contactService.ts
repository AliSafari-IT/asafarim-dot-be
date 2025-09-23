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
  attachments?: Array<{
    file: File;
    type: 'document' | 'image';
  }>;
  links?: string[];
  referenceNumber?: string;
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
    // Format the message with attachments and links information
    const formattedMessage = formatEmailContent(data);

    // Prepare the template parameters
    const templateParams = {
      from_name: data.name || data.from_name,
      reply_to: data.email || data.reply_to,
      subject: data.subject || 'Website Contact',
      message: formattedMessage,
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

/**
 * Formats the email content with all the necessary information
 * @param data Contact form data
 * @returns Formatted email content
 */
function formatEmailContent(data: ContactRequest): string {
  let content = `Message from: ${data.name} <${data.email}>\n\n`;

  // Add reference number if provided
  if (data.referenceNumber) {
    content += `Reference Number: ${data.referenceNumber}\n\n`;
  }

  // Add the main message
  content += `${data.message}\n`;

  // Add attachments information if any
  if (data.attachments && data.attachments.length > 0) {
    content += '\nAttachments:\n';
    content += data.attachments
      .map(att => `- ${att.file.name} (${att.type})`)
      .join('\n');
  }

  // Add links if any
  if (data.links && data.links.length > 0) {
    content += '\n\nLinks:\n';
    content += data.links.map(link => `- ${link}`).join('\n');
  }

  return content;
}
