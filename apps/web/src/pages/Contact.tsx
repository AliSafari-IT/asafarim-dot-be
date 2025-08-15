import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { submitContactForm, initEmailJS } from '../api/contactService';
import { useAuth } from '@asafarim/shared-ui-react';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormStatus {
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  success: boolean;
}

export default function Contact() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  useEffect(() => {
    setEmail(user?.email || '');    
  }, [user]);
  console.log("email", email);

  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: email,
    subject: 'Website Contact',
    message: ''
  });
  
  const [status, setStatus] = useState<FormStatus>({
    submitting: false,
    submitted: false,
    error: null,
    success: false
  });

  // Initialize EmailJS when component mounts
  useEffect(() => {
    initEmailJS();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setStatus({
      submitting: true,
      submitted: false,
      error: null,
      success: false
    });

    formData.name = email + " <" + (formData.name +  ' reply to: ' + formData.email) + ">";

    try {
      const response = await submitContactForm(formData);
      
      if (response.status === 200) {
        setStatus({
          submitting: false,
          submitted: true,
          error: null,
          success: true
        });
        
        // Reset form after successful submission
        setFormData({
          name: '',
          email: email,
          subject: 'Website Contact',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: true,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false
      });
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="mb-4">Contact Us</h1>
        <p className="text-lg mb-8">
          Have questions about our services or want to discuss a project? Reach out to us using the form below.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="p-4 bg-background shadow-sm rounded-lg">
            <h2 className="text-primary mb-4">Send a Message</h2>
            
            {status.success ? (
              <div className="message message-success">
                <div className="message-header">
                  <svg xmlns="http://www.w3.org/2000/svg" className="message-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="message-title">Thank you for your message!</h3>
                </div>
                <p className="message-content">We've received your inquiry and will get back to you soon.</p>
              </div>
            ) : (
              <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-sm">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="form-input" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="flex flex-col gap-sm">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-input" 
                    value={formData.email || email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="flex flex-col gap-sm">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    className="form-input" 
                    value={formData.subject}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="flex flex-col gap-sm">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    className="form-input" 
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                {status.error && (
                  <div className="message message-error">
                    <div className="message-header">
                      <svg xmlns="http://www.w3.org/2000/svg" className="message-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p className="message-title">Error</p>
                    </div>
                    <p className="message-content">{status.error}</p>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={status.submitting}
                >
                  {status.submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
          
          <div className="p-4 bg-background shadow-sm rounded-lg">
            <h2 className="text-primary mb-4">Contact Information</h2>
            <div className="flex flex-col gap-md">
              <div>
                <h3 className="text-lg font-semibold mb-1">Email</h3>
                <p>contact@asafarim.be</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-1">Location</h3>
                <p>Kermt, België</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-1">Working Hours</h3>
                <p>Monday - Friday: 9AM - 5PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
