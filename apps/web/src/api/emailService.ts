import { apiGet } from "./core";

export interface EmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments?: Array<{
    file: File;
    type: 'document' | 'image';
  }>;
  links?: string[];
  referenceNumber?: string; // The unique ID for this conversation
  referingToConversation?: string; // Reference to another conversation
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data:*/*;base64, prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Send an email using the Core.Api endpoint
 */
export async function sendEmail(data: EmailRequest, token?: string | null): Promise<EmailResponse> {
  try {
    // Convert attachments to base64
    const attachments = data.attachments 
      ? await Promise.all(data.attachments.map(async ({ file }) => ({
          fileName: file.name,
          contentType: file.type,
          base64Content: await fileToBase64(file)
        })))
      : undefined;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Only add Authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const result = await apiGet<EmailResponse>(`/email/send`, {
      method: 'POST',
      
      headers,
      credentials: 'include',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        referenceNumber: data.referenceNumber,
        referingToConversation: data.referingToConversation,
        attachments,
        links: data.links,
      }),
    });

    // The apiGet function already handles the response.ok check and throws an error if needed
    // So if we get here, the request was successful

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
