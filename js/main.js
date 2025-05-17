// Main JavaScript file for Tuition Website

document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initNavbar();
  initFAQs();
  initChatbot();
  initBookingSystem();
  initCalendar();

  // Check if the user is logged in
  checkAuthStatus();
});

// Navigation bar handling
function initNavbar() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    // Make sure hamburger is visible on mobile
    if (window.innerWidth <= 768) {
      hamburger.style.display = 'block';
    }

    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });

    // Add click event to nav links to close menu when clicked
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          navMenu.classList.remove('active');
          hamburger.classList.remove('active');
        }
      });
    });
  }

  // Hide menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.nav-menu') && !event.target.closest('.hamburger') && navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      hamburger.style.display = 'none';
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    } else {
      hamburger.style.display = 'block';
    }
  });
}

// FAQ accordion functionality
function initFAQs() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  if (faqQuestions.length) {
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        question.classList.toggle('active');

        // Close other FAQs
        faqQuestions.forEach(item => {
          if (item !== question && item.classList.contains('active')) {
            item.classList.remove('active');
          }
        });
      });
    });
  }
}

// Simple AI chatbot functionality
function initChatbot() {
  console.log('Main.js initChatbot called');

  // Check if OpenAI chatbot is available - if so, don't initialize the simple chatbot
  if (window.OpenAIChat) {
    console.log('OpenAI chatbot detected, skipping simple chatbot initialization');
    return;
  }

  // Check if we're on the contact page with the OpenAI chatbot
  const scriptTags = document.querySelectorAll('script');
  for (const script of scriptTags) {
    if (script.src && script.src.includes('openai-chat.js')) {
      console.log('OpenAI script detected, skipping simple chatbot initialization');
      return;
    }
  }

  console.log('No OpenAI chatbot detected, initializing simple chatbot');

  const chatForm = document.querySelector('.chat-form');
  const chatInput = document.querySelector('.chat-input input');
  const chatMessages = document.querySelector('.chat-messages');

  if (chatForm && chatInput && chatMessages) {
    console.log('Adding event listener to chat form (simple chatbot)');

    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Simple chatbot handling message');

      const message = chatInput.value.trim();
      if (message !== '') {
        // Add user message
        addMessage(message, 'sent');
        chatInput.value = '';

        // Simulate AI response after a short delay
        setTimeout(() => {
          const aiResponse = generateAIResponse(message);
          addMessage(aiResponse, 'received');
        }, 1000);
      }
    });
  }
}

// Add a message to the chat interface
function addMessage(text, type) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `message-${type}`);
  messageDiv.textContent = text;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simple AI response generator based on keywords
function generateAIResponse(message) {
  message = message.toLowerCase();

  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! How can I help you with your tuition needs today?";
  } else if (message.includes('cost') || message.includes('price') || message.includes('fee')) {
    return "Our tuition fees vary based on the subject and level. You can check our pricing page for details or contact us for a personalized quote.";
  } else if (message.includes('book') || message.includes('appointment') || message.includes('schedule')) {
    return "You can book a session through our booking system. Would you like me to guide you through the process?";
  } else if (message.includes('subject') || message.includes('teach') || message.includes('tutor')) {
    return "We offer tuition in various subjects including Mathematics, Science, English, and more. Please visit our products page to see our complete offerings.";
  } else if (message.includes('location') || message.includes('where') || message.includes('address')) {
    return "We offer both online tutoring and in-person tutoring at our center in Singapore. Would you like more details?";
  } else if (message.includes('singapore') || message.includes('international')) {
    return "We specialize in helping international students adapt to the Singapore education system. Check our FAQ page for more information about studying in Singapore.";
  } else if (message.includes('thank')) {
    return "You're welcome! Feel free to ask if you have any other questions.";
  } else {
    return "I'm not sure I understand. Could you please rephrase or check our FAQ page for more information? Alternatively, you can contact our team directly for personalized assistance.";
  }
}

// Booking system functionality
function initBookingSystem() {
  const bookingForm = document.querySelector('.booking-form');
  const nextButtons = document.querySelectorAll('.btn-next');
  const prevButtons = document.querySelectorAll('.btn-prev');
  const formSteps = document.querySelectorAll('.form-step');
  const stepIndicators = document.querySelectorAll('.step');

  if (bookingForm && nextButtons.length && formSteps.length) {
    let currentStep = 0;

    // Update step visibility
    function updateSteps() {
      formSteps.forEach((step, index) => {
        step.style.display = index === currentStep ? 'block' : 'none';
      });

      stepIndicators.forEach((step, index) => {
        if (index <= currentStep) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
    }

    // Initialize
    updateSteps();

    // Next button handlers
    nextButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();

        // Validate current step
        if (validateStep(currentStep)) {
          currentStep++;
          if (currentStep >= formSteps.length) {
            currentStep = formSteps.length - 1;
          }
          updateSteps();
        }
      });
    });

    // Previous button handlers
    prevButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();

        currentStep--;
        if (currentStep < 0) {
          currentStep = 0;
        }
        updateSteps();
      });
    });

    // Form submission
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();

      if (validateStep(currentStep)) {
        // Collect form data
        const formData = new FormData(bookingForm);
        const bookingData = {};

        for (const [key, value] of formData.entries()) {
          bookingData[key] = value;
        }

        // You would normally send this data to your server
        // For demo purposes, we'll just simulate success
        showBookingConfirmation(bookingData);
      }
    });
  }
}

// Validate booking form step
function validateStep(step) {
  const formStep = document.querySelectorAll('.form-step')[step];
  if (!formStep) return true;

  const requiredFields = formStep.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('is-invalid');
    } else {
      field.classList.remove('is-invalid');
    }
  });

  return isValid;
}

// Show booking confirmation
function showBookingConfirmation(data) {
  const bookingContainer = document.querySelector('.booking-form-container');
  if (!bookingContainer) return;

  // Create confirmation message
  const confirmationDiv = document.createElement('div');
  confirmationDiv.classList.add('booking-confirmation', 'card', 'fade-in');

  const confirmationContent = `
    <div class="card-body text-center">
      <h2 class="card-title">Booking Confirmed!</h2>
      <p>Thank you for booking a session with us, ${data.name || 'Student'}!</p>
      <p>We've sent a confirmation email to ${data.email || 'your email address'} with all the details including your Zoom link for the session.</p>
      <p>Your session is scheduled for: <strong>${data.date || 'the selected date'} at ${data.time || 'the selected time'}</strong></p>
      <div class="mt-4">
        <button class="btn" onclick="window.location.href='index.html'">Return to Home</button>
      </div>
    </div>
  `;

  confirmationDiv.innerHTML = confirmationContent;

  // Replace the form with confirmation
  bookingContainer.innerHTML = '';
  bookingContainer.appendChild(confirmationDiv);

  // Send confirmation email (in a real app, this would be done server-side)
  console.log('Booking data:', data);
}

// Calendar functionality
function initCalendar() {
  const calendarContainer = document.querySelector('.calendar-container');
  if (!calendarContainer) return;

  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Render calendar
  renderCalendar(currentMonth, currentYear, calendarContainer);

  // Month navigation
  const prevMonthBtn = document.querySelector('.prev-month');
  const nextMonthBtn = document.querySelector('.next-month');

  if (prevMonthBtn && nextMonthBtn) {
    let displayMonth = currentMonth;
    let displayYear = currentYear;

    prevMonthBtn.addEventListener('click', () => {
      displayMonth--;
      if (displayMonth < 0) {
        displayMonth = 11;
        displayYear--;
      }
      renderCalendar(displayMonth, displayYear, calendarContainer);
    });

    nextMonthBtn.addEventListener('click', () => {
      displayMonth++;
      if (displayMonth > 11) {
        displayMonth = 0;
        displayYear++;
      }
      renderCalendar(displayMonth, displayYear, calendarContainer);
    });
  }
}

// Render calendar UI
function renderCalendar(month, year, container) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Update header
  const calendarHeader = container.querySelector('.calendar-header h3');
  if (calendarHeader) {
    calendarHeader.textContent = `${monthNames[month]} ${year}`;
  }

  // Generate days
  const calendarDays = container.querySelector('.calendar-days');
  if (calendarDays) {
    calendarDays.innerHTML = '';

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.classList.add('calendar-day', 'empty');
      calendarDays.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEl = document.createElement('div');
      dayEl.classList.add('calendar-day');
      dayEl.textContent = i;

      // Highlight today's date
      const today = new Date();
      if (today.getDate() === i && today.getMonth() === month && today.getFullYear() === year) {
        dayEl.classList.add('today');
      }

      // Make days clickable for scheduling
      dayEl.addEventListener('click', () => {
        const selectedDays = calendarDays.querySelectorAll('.active');
        selectedDays.forEach(day => day.classList.remove('active'));
        dayEl.classList.add('active');

        // Update any related date inputs
        const dateInput = document.querySelector('input[name="date"]');
        if (dateInput) {
          const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
          dateInput.value = formattedDate;
        }
      });

      calendarDays.appendChild(dayEl);
    }
  }
}

// Authentication check
function checkAuthStatus() {
  // In a real app, this would check for a valid session or token
  const isLoggedIn = localStorage.getItem('tutionWebsiteLoggedIn') === 'true';

  // Update UI based on auth status
  const authLinks = document.querySelectorAll('.auth-link');
  const profileLinks = document.querySelectorAll('.profile-link');

  if (authLinks.length && profileLinks.length) {
    if (isLoggedIn) {
      authLinks.forEach(link => link.style.display = 'none');
      profileLinks.forEach(link => link.style.display = 'block');
    } else {
      authLinks.forEach(link => link.style.display = 'block');
      profileLinks.forEach(link => link.style.display = 'none');
    }
  }
}

// Login functionality
function handleLogin(e) {
  e.preventDefault();

  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Simple validation
  if (!email || !password) {
    showLoginError('Please enter both email and password');
    return;
  }

  // In a real app, this would make an API call to validate credentials
  // For demo purposes, we'll simulate a successful login

  // Simulate login process
  showLoginLoading(true);

  setTimeout(() => {
    localStorage.setItem('tutionWebsiteLoggedIn', 'true');
    localStorage.setItem('tutionWebsiteUser', email);

    // Redirect to dashboard or home page
    window.location.href = 'dashboard.html';
  }, 1500);
}

// Show login error
function showLoginError(message) {
  const errorDiv = document.querySelector('.login-error');

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
      const newErrorDiv = document.createElement('div');
      newErrorDiv.classList.add('login-error', 'alert', 'alert-danger');
      newErrorDiv.textContent = message;
      loginForm.prepend(newErrorDiv);
    }
  }
}

// Show/hide loading indicator
function showLoginLoading(isLoading) {
  const submitBtn = document.querySelector('.login-form button[type="submit"]');
  if (!submitBtn) return;

  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
}

// Logout functionality
function handleLogout() {
  // Clear authentication data
  localStorage.removeItem('tutionWebsiteLoggedIn');
  localStorage.removeItem('tutionWebsiteUser');

  // Redirect to home page
  window.location.href = 'index.html';
}

// Add event listener for logout links
document.addEventListener('DOMContentLoaded', function() {
  const logoutLinks = document.querySelectorAll('.logout-link');

  logoutLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
  });

  // Add event listener for login form
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

// Group chat functionality
function initGroupChat() {
  const groupChatContainer = document.querySelector('.group-chat-container');
  if (!groupChatContainer) return;

  const chatForm = groupChatContainer.querySelector('.chat-form');
  const chatInput = groupChatContainer.querySelector('.chat-input input');
  const chatMessages = groupChatContainer.querySelector('.chat-messages');

  if (chatForm && chatInput && chatMessages) {
    // Example data - in a real app this would come from a database
    const sampleMessages = [
      { user: 'John D.', message: 'Hi everyone! Just moved to Singapore last week.', time: '2 days ago' },
      { user: 'Lisa T.', message: 'Welcome John! How are you finding it so far?', time: '2 days ago' },
      { user: 'John D.', message: 'Thanks! Still adjusting to the weather but loving the food!', time: '2 days ago' },
      { user: 'Admin', message: 'Remember everyone, we have a meetup this Saturday at the central library.', time: '1 day ago' },
      { user: 'Sarah L.', message: 'Does anyone know a good place to get international phone plans?', time: '5 hours ago' },
      { user: 'Mike P.', message: 'I use Singtel, they have good plans for international students.', time: '3 hours ago' }
    ];

    // Display sample messages
    sampleMessages.forEach(msg => {
      const messageHTML = `
        <div class="group-chat-message">
          <div class="message-header">
            <span class="message-user">${msg.user}</span>
            <span class="message-time">${msg.time}</span>
          </div>
          <div class="message-body">${msg.message}</div>
        </div>
      `;

      chatMessages.innerHTML += messageHTML;
    });

    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Handle form submission
    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const message = chatInput.value.trim();
      if (message) {
        // Get user info from localStorage or use "You"
        const username = localStorage.getItem('tutionWebsiteUser') || 'You';

        // Create message HTML
        const messageHTML = `
          <div class="group-chat-message user-message">
            <div class="message-header">
              <span class="message-user">${username}</span>
              <span class="message-time">Just now</span>
            </div>
            <div class="message-body">${message}</div>
          </div>
        `;

        chatMessages.innerHTML += messageHTML;
        chatInput.value = '';

        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });
  }
}

// Initialize group chat if on the right page
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.group-chat-container')) {
    initGroupChat();
  }
});

// Notes functionality for the dashboard
function initNotes() {
  const notesContainer = document.querySelector('.notes-container');
  if (!notesContainer) return;

  const notesList = notesContainer.querySelector('.notes-list');
  const noteForm = notesContainer.querySelector('.note-form');
  const noteInput = notesContainer.querySelector('.note-input');

  if (notesList && noteForm && noteInput) {
    // Load saved notes
    loadNotes();

    // Handle form submission
    noteForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const noteText = noteInput.value.trim();
      if (noteText) {
        // Create new note
        const note = {
          id: Date.now(), // Use timestamp as ID
          text: noteText,
          date: new Date().toLocaleString()
        };

        // Add to the list
        addNoteToList(note);

        // Save to localStorage
        saveNote(note);

        // Clear input
        noteInput.value = '';
      }
    });

    // Delete note functionality
    notesList.addEventListener('click', function(e) {
      if (e.target.classList.contains('delete-note')) {
        const noteId = e.target.getAttribute('data-id');
        if (noteId) {
          // Remove from DOM
          const noteElement = document.getElementById(`note-${noteId}`);
          if (noteElement) {
            noteElement.remove();
          }

          // Remove from localStorage
          deleteNote(noteId);
        }
      }
    });
  }
}

// Load notes from localStorage
function loadNotes() {
  const notesList = document.querySelector('.notes-list');
  if (!notesList) return;

  // Get notes from localStorage
  const storedNotes = localStorage.getItem('tutionWebsiteNotes');

  if (storedNotes) {
    const notes = JSON.parse(storedNotes);
    notes.forEach(note => {
      addNoteToList(note);
    });
  }
}

// Add note to UI
function addNoteToList(note) {
  const notesList = document.querySelector('.notes-list');
  if (!notesList) return;

  const noteElement = document.createElement('div');
  noteElement.id = `note-${note.id}`;
  noteElement.classList.add('note-item', 'card', 'mb-3', 'fade-in');

  noteElement.innerHTML = `
    <div class="card-body">
      <p>${note.text}</p>
      <div class="note-meta">
        <small class="text-muted">${note.date}</small>
        <button class="delete-note btn btn-sm btn-danger" data-id="${note.id}">Delete</button>
      </div>
    </div>
  `;

  notesList.prepend(noteElement);
}

// Save note to localStorage
function saveNote(note) {
  let notes = [];

  // Get existing notes
  const storedNotes = localStorage.getItem('tutionWebsiteNotes');
  if (storedNotes) {
    notes = JSON.parse(storedNotes);
  }

  // Add new note
  notes.push(note);

  // Save back to localStorage
  localStorage.setItem('tutionWebsiteNotes', JSON.stringify(notes));
}

// Delete note from localStorage
function deleteNote(noteId) {
  // Get existing notes
  const storedNotes = localStorage.getItem('tutionWebsiteNotes');
  if (!storedNotes) return;

  let notes = JSON.parse(storedNotes);

  // Filter out the note to delete
  notes = notes.filter(note => note.id.toString() !== noteId.toString());

  // Save back to localStorage
  localStorage.setItem('tutionWebsiteNotes', JSON.stringify(notes));
}

// Initialize notes if on the dashboard
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.notes-container')) {
    initNotes();
  }
});

// Student progress tracking
function initProgressTracking() {
  const progressContainer = document.querySelector('.progress-container');
  if (!progressContainer) return;

  // Example data - in a real app this would come from an API
  const progressData = {
    student: "Alex Smith",
    overall: 85,
    subjects: [
      { name: "Mathematics", score: 92, improvement: "+5" },
      { name: "Science", score: 78, improvement: "+3" },
      { name: "English", score: 85, improvement: "+1" }
    ],
    recent_tests: [
      { name: "Math Quiz 3", score: 90, date: "2023-05-10" },
      { name: "Science Test", score: 82, date: "2023-05-05" },
      { name: "English Essay", score: 88, date: "2023-04-28" }
    ]
  };

  // Update student name
  const studentName = progressContainer.querySelector('.student-name');
  if (studentName) {
    studentName.textContent = progressData.student;
  }

  // Update overall progress
  const overallProgress = progressContainer.querySelector('.overall-progress');
  if (overallProgress) {
    overallProgress.style.width = `${progressData.overall}%`;
    overallProgress.textContent = `${progressData.overall}%`;
  }

  // Update subject progress
  const subjectsContainer = progressContainer.querySelector('.subjects-progress');
  if (subjectsContainer && progressData.subjects.length) {
    subjectsContainer.innerHTML = '';

    progressData.subjects.forEach(subject => {
      const subjectHTML = `
        <div class="subject-item mb-3">
          <div class="d-flex justify-content-between">
            <span>${subject.name}</span>
            <span>${subject.score}% <small class="text-success">${subject.improvement}</small></span>
          </div>
          <div class="progress">
            <div class="progress-bar" role="progressbar" style="width: ${subject.score}%"
                aria-valuenow="${subject.score}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      `;

      subjectsContainer.innerHTML += subjectHTML;
    });
  }

  // Update recent tests
  const testsContainer = progressContainer.querySelector('.recent-tests');
  if (testsContainer && progressData.recent_tests.length) {
    testsContainer.innerHTML = '';

    progressData.recent_tests.forEach(test => {
      const testHTML = `
        <tr>
          <td>${test.name}</td>
          <td>${test.score}%</td>
          <td>${test.date}</td>
        </tr>
      `;

      testsContainer.innerHTML += testHTML;
    });
  }
}

// Initialize progress tracking if on the dashboard
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.progress-container')) {
    initProgressTracking();
  }
});