export default function Contact() {
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
            <form className="flex flex-col gap-md">
              <div className="flex flex-col gap-sm">
                <label htmlFor="name" className="form-label">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="form-input" 
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
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="btn-submit mt-2" 
              >
                Send Message
              </button>
            </form>
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
                <p>Silicon Valley, California</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-1">Working Hours</h3>
                <p>Monday - Friday: 9AM - 5PM PST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
