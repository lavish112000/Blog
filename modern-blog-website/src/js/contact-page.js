/**
 * =====================================
 * CONTACT PAGE FUNCTIONALITY
 * =====================================
 */

class ContactPageManager {
    constructor() {
        // Get DOM elements for form, message display, and FAQ items
        this.contactForm = document.getElementById('contactForm');
        this.formMessage = document.getElementById('formMessage');
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        // Initialize form validation and FAQ accordion functionality
        this.setupFormValidation();
        this.setupFAQAccordion();
    }

    /**
     * Setup Form Validation and Submission
     */
    setupFormValidation() {
        if (!this.contactForm) return;

        // Add submit event listener to handle form submission
        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateForm()) {
                this.submitForm();
            }
        });

        // Add real-time validation for all form inputs
        const inputs = this.contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('focus', () => {
                this.clearFieldError(input);
            });
        });
    }

    /**
     * Validate individual field
     */
    validateField(field) {
        const formGroup = field.closest('.form-group');
        let isValid = true;
        let errorMessage = '';

        // Validate name field
        if (field.name === 'name') {
            if (field.value.trim().length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters';
            }
        }

        // Validate email field
        if (field.name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Validate subject field
        if (field.name === 'subject') {
            if (field.value === '') {
                isValid = false;
                errorMessage = 'Please select a subject';
            }
        }

        // Validate message field
        if (field.name === 'message') {
            if (field.value.trim().length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters';
            }
        }

        // Validate privacy checkbox
        if (field.name === 'privacy') {
            if (!field.checked) {
                isValid = false;
                errorMessage = 'You must agree to the privacy policy';
            }
        }

        if (!isValid) {
            this.showFieldError(formGroup, errorMessage);
        } else {
            this.clearGroupError(formGroup);
        }

        return isValid;
    }

    /**
     * Validate entire form
     */
    validateForm() {
        // Get all required inputs and validate each one
        const inputs = this.contactForm.querySelectorAll('input[required], textarea[required], select[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    /**
     * Show field error
     */
    showFieldError(formGroup, message) {
        formGroup.classList.add('error');
        const errorElement = formGroup.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            this.clearGroupError(formGroup);
        }
    }

    /**
     * Clear group error
     */
    clearGroupError(formGroup) {
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    /**
     * Submit form
     */
    submitForm() {
        // Show loading state and simulate API call delay
        this.showLoadingState();

        setTimeout(() => {
            this.showSuccessMessage();
            this.contactForm.reset();
            this.contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1500);
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const submitBtn = this.contactForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>';
    }

    /**
     * Show success message
     */
    showSuccessMessage() {
        const submitBtn = this.contactForm.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';

        this.formMessage.classList.remove('error');
        this.formMessage.classList.add('success');
        this.formMessage.textContent = '✓ Thank you! Your message has been sent successfully. We\'ll be in touch soon!';

        // Hide success message after 5 seconds
        setTimeout(() => {
            this.formMessage.classList.remove('success');
            this.formMessage.textContent = '';
        }, 5000);
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.formMessage.classList.remove('error');
        this.formMessage.classList.add('success');
        this.formMessage.textContent = '✗ ' + message;

        const submitBtn = this.contactForm.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
    }

    /**
     * Setup FAQ Accordion
     */
    setupFAQAccordion() {
        // Add click event listeners to each FAQ question
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                this.toggleFAQ(item);
            });
        });
    }

    /**
     * Toggle FAQ item
     */
    toggleFAQ(item) {
        // Check if the item is already active
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items first
        this.faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });

        // Open the clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    }
}

// Initialize Contact Page Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactPageManager();
});
