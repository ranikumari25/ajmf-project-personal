// ==========================================================
// CONTACT US PAGE JAVASCRIPT
// Handles FAQ accordion toggle & contact form email submission
// Target recipient: surajsahani@navgurukul.org
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

    // ---------------- 1. FAQ ACCORDION ----------------
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');

        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherBtn = otherItem.querySelector('.faq-question');
                    const otherAns = otherItem.querySelector('.faq-answer');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherAns) otherAns.style.display = 'none';
                });

                // Toggle clicked item
                if (!isOpen) {
                    item.classList.add('active');
                    questionBtn.setAttribute('aria-expanded', 'true');
                    const answer = item.querySelector('.faq-answer');
                    if (answer) answer.style.display = 'block';
                }
            });
        }
    });

    // ---------------- 2. REAL EMAIL FORM SUBMISSION ----------------
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullNameInput = document.getElementById('fullName');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            const fullName = fullNameInput?.value.trim() || '';
            const email = emailInput?.value.trim() || '';
            const phone = phoneInput?.value.trim() || 'N/A';
            const subject = subjectInput?.value.trim() || 'General Inquiry';
            const message = messageInput?.value.trim() || '';
            const currentLang = localStorage.getItem('language') || 'en';

            // Validation
            if (!fullName || !email || !message) {
                if (formStatus) {
                    formStatus.style.color = '#ef4444';
                    formStatus.textContent = (currentLang === 'hi')
                        ? 'कृपया सभी आवश्यक फ़ील्ड (*) भरें।'
                        : 'Please fill in all required fields (*).';
                }
                return;
            }

            // Disable button and give loading feedback
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.innerHTML = (currentLang === 'hi')
                    ? '<i class="fa-solid fa-spinner fa-spin"></i> भेजा जा रहा है...'
                    : '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            }

            if (formStatus) {
                formStatus.style.color = '#0284c7';
                formStatus.textContent = (currentLang === 'hi')
                    ? 'आपका संदेश भेजा जा रहा है...'
                    : 'Sending your message...';
            }

            try {
                const response = await fetch('https://formsubmit.co/ajax/surajsahani@navgurukul.org', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: fullName,
                        email: email,
                        phone: phone,
                        subject: subject,
                        message: message,
                        _subject: `New Contact Message from ${fullName} - AJMF Website`,
                        _template: 'table',
                        _captcha: 'false'
                    })
                });

                const result = await response.json().catch(() => ({}));

                if (response.ok || result.success === "true" || result.success === true) {
                    if (formStatus) {
                        formStatus.style.color = '#16a34a';
                        formStatus.textContent = (currentLang === 'hi')
                            ? 'धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है। हम जल्द ही आपसे संपर्क करेंगे।'
                            : 'Your message has been sent successfully.';
                    }
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Submission error');
                }
            } catch (err) {
                console.error('Contact Form Submission Error:', err);
                if (formStatus) {
                    formStatus.style.color = '#ef4444';
                    formStatus.textContent = (currentLang === 'hi')
                        ? 'आपका संदेश भेजने में असमर्थ। कृपया बाद में पुनः प्रयास करें।'
                        : 'Unable to send your message. Please try again later.';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = originalBtnHTML;
                }
            }
        });
    }

});
