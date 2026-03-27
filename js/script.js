// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const apiKey = 'NsOhvAht7q784WoaOmatIlR7lABU8gj0Cue0iEM2';
const baseUrl = 'https://api.nasa.gov/planetary/apod';

function showMessage(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>${message}</p>
    </div>
  `;
}

function createGalleryItem(item) {
  const card = document.createElement('article');
  card.className = 'gallery-item';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Open details for ${item.title}`);

  card.innerHTML = `
    <img src="${item.url}" alt="${item.title}" />
    <p><strong>${item.title}</strong></p>
    <p><strong>Date:</strong> ${item.date}</p>
  `;

  card.addEventListener('click', () => openModal(item));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(item);
    }
  });

  return card;
}

function openModal(item) {
  modalImage.src = item.hdurl || item.url;
  modalImage.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = `Date: ${item.date}`;
  modalExplanation.textContent = item.explanation;
  imageModal.classList.remove('hidden');
}

function closeModal() {
  imageModal.classList.add('hidden');
  modalImage.src = '';
}

function renderGallery(items) {
  gallery.innerHTML = '';

  if (!items.length) {
    showMessage('No space images were found for this date range. Try different dates.');
    return;
  }

  // Show newest APOD first so the latest image appears at the top.
  items
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((item) => {
      gallery.appendChild(createGalleryItem(item));
    });
}

async function getNasaData(startDate, endDate) {
  try {
    const response = await fetch(
      `${baseUrl}?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // NASA returns an array for date ranges and a single object for one day.
    const items = (Array.isArray(data) ? data : [data]).filter(
      (item) => item.media_type === 'image'
    );
    renderGallery(items);
  } catch (error) {
    console.error("Could not fetch NASA data:", error);
    showMessage('Could not load NASA data right now. Please try again.');
  }
}

getImagesButton.addEventListener('click', () => {
  if (!startInput.value || !endInput.value) {
    showMessage('Please choose both a start date and an end date.');
    return;
  }

  if (startInput.value > endInput.value) {
    showMessage('Start date must be before end date.');
    return;
  }

  showMessage('Loading space images...');
  getNasaData(startInput.value, endInput.value);
});

closeModalButton.addEventListener('click', closeModal);

imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !imageModal.classList.contains('hidden')) {
    closeModal();
  }
});

// Load the default date range as soon as the page opens.
showMessage('Loading space images...');
getNasaData(startInput.value, endInput.value);