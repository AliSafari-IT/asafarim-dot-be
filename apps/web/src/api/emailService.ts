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
  referenceNumber?: string;
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
export async function sendEmail(data: EmailRequest): Promise<EmailResponse> {
  try {
    // Convert attachments to base64
    const attachments = data.attachments 
      ? await Promise.all(data.attachments.map(async ({ file }) => ({
          fileName: file.name,
          contentType: file.type,
          base64Content: await fileToBase64(file)
        })))
      : undefined;

    const response = await fetch(`${import.meta.env.VITE_CORE_API_URL}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        referenceNumber: data.referenceNumber,
        attachments,
        links: data.links,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
