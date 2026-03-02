const contactForm = document.querySelector('form');
const messageDiv = document.getElementById('formMessage');
const submitBtn = contactForm.querySelector('.form-submit');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  messageDiv.className = 'form-message';
  messageDiv.textContent = '';

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok) {
      messageDiv.className = 'form-message success';
      messageDiv.textContent = '\u2713 Consultation request sent! Our team will contact you shortly.';
      contactForm.reset();
    } else {
      throw new Error(result.message || 'Failed to send. Please try again.');
    }
  } catch (err) {
    messageDiv.className = 'form-message error';
    messageDiv.textContent = '\u2717 ' + err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Request Consultation';
  }
});
