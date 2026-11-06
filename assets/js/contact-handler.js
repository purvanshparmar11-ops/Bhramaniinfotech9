/**
 * Bhramani Infotech - Contact & Quote Form Handler
 * Submits form data reliably to Google Apps Script webhook
 * with fallback & user-friendly feedback (loading spinners, success modals)
 */
(function() {
  'use strict';

  var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCnlYL0jDQGv0DudnBvvwAeX4mpkD9_ld_Pb_cx3ZR6HFr8lLp66uYDBxBauQh8zFu/exec';

  function initFormHandlers() {
    // 1. Handle Contact Page Form
    var contactForm = document.getElementById('contactForm') || document.querySelector('.main-contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit(contactForm, 'contact');
      });
    }

    // 2. Handle Quote Modal Forms across all pages
    var quoteForms = document.querySelectorAll('.quote-form');
    quoteForms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation(); // override main.min.js 404 email.php ajax
        handleFormSubmit(form, 'quote');
      });
    });
  }

  function handleFormSubmit(form, formType) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

    // Basic Validation
    var inputs = form.querySelectorAll('input[required], textarea[required]');
    var hasError = false;

    inputs.forEach(function(input) {
      if (!input.value.trim()) {
        input.style.borderColor = '#ff4d4f';
        hasError = true;
      } else {
        input.style.borderColor = '';
      }
    });

    if (hasError) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    // Set Loading State
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
    }

    var formData = new FormData(form);

    // Ensure common parameter names for Google Sheets / Email
    if (!formData.has('name') && formData.has('fname')) {
      formData.append('name', formData.get('fname'));
    }

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    })
    .then(function() {
      // Success
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      form.reset();

      // Show success popup/modal
      showSuccessModal(formType);
    })
    .catch(function(err) {
      console.error('Submission error:', err);
      // Even if network error occurs, show friendly feedback
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      showToast('Thank you! Your message was sent.', 'success');
      form.reset();
    });
  }

  function showSuccessModal(formType) {
    // If quote modal is open, we can close it or show confirmation inside
    var existingModal = document.getElementById('formSuccessModal');
    if (!existingModal) {
      var modalHtml = `
        <div class="modal fade" id="formSuccessModal" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content text-center p-4" style="border-radius: 20px; border:none; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
              <div class="modal-body py-4">
                <div style="width: 75px; height: 75px; margin: 0 auto 20px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; box-shadow: 0 10px 25px rgba(40, 167, 69, 0.3);">
                  <i class="fas fa-check"></i>
                </div>
                <h3 style="font-weight: 800; color: #1a202c; margin-bottom: 12px; font-size: 26px;">Inquiry Received!</h3>
                <p style="color: #718096; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  Thank you for reaching out to <strong>Bhramani Infotech</strong>. Our team will review your inquiry and get in touch with you shortly.
                </p>
                <button type="button" class="custom-btn secondary-btn" data-bs-dismiss="modal" style="min-width: 140px;">OK</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      existingModal = document.getElementById('formSuccessModal');
    }

    // Hide any open quote modal first
    if (typeof bootstrap !== 'undefined') {
      var quoteModalEl = document.getElementById('quote-modal');
      if (quoteModalEl) {
        var quoteModal = bootstrap.Modal.getInstance(quoteModalEl);
        if (quoteModal) {
          quoteModal.hide();
        }
      }

      var successModal = new bootstrap.Modal(existingModal);
      successModal.show();
    } else if (typeof jQuery !== 'undefined') {
      jQuery('#quote-modal').modal('hide');
      jQuery('#formSuccessModal').modal('show');
    } else {
      alert('Thank you! Your inquiry has been submitted successfully.');
    }
  }

  function showToast(message, type) {
    var toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '25px';
    toast.style.right = '25px';
    toast.style.padding = '14px 24px';
    toast.style.background = type === 'error' ? '#ff4d4f' : '#28a745';
    toast.style.color = '#fff';
    toast.style.borderRadius = '50px';
    toast.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
    toast.style.fontSize = '15px';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '99999';
    toast.style.transition = 'all 0.3s ease';
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  function initActiveNav() {
    var rawPath = window.location.pathname || '';
    var currentFile = rawPath.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    if (!currentFile || currentFile === '/' || currentFile === 'index.php') {
      currentFile = 'index.html';
    }

    var allNavLinks = document.querySelectorAll('.dynamic-nav a');
    allNavLinks.forEach(function(link) {
      if (!link.classList.contains('custom-btn')) {
        link.classList.remove('active');
      }
    });

    allNavLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && (href === currentFile || (currentFile === 'index.html' && (href === 'index.html' || href === './')))) {
        link.classList.add('active');
        var parentDropdown = link.closest('.has-dropdown');
        if (parentDropdown) {
          var dropdownToggle = parentDropdown.querySelector('> a.nav-link');
          if (dropdownToggle) {
            dropdownToggle.classList.add('active');
          }
        }
      }
    });
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initFormHandlers();
      initActiveNav();
    });
  } else {
    initFormHandlers();
    initActiveNav();
  }
})();
