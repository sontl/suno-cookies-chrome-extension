// DOM elements
let currentCookieElement;
let lastUpdateElement;
let refreshButton;

// Function to format date
function formatDate(date) {
  return new Date(date).toLocaleString();
}

// Function to truncate cookie value for display
function truncateCookieValue(value) {
  if (!value) return 'No cookie found';
  // Show first 20 and last 20 characters
  return value.length > 40 ? `${value.substring(0, 20)}...${value.substring(value.length - 20)}` : value;
}

// Function to update the UI
async function updateUI() {
  try {
    console.log('Starting UI update...');
    console.log('DOM Elements status:', {
      currentCookieElement: currentCookieElement ? 'exists' : 'null',
      lastUpdateElement: lastUpdateElement ? 'exists' : 'null',
      refreshButton: refreshButton ? 'exists' : 'null'
    });
    
    // Get current cookie
    const cookie = await chrome.cookies.get({
      name: '__session',
      url: 'https://suno.com'
    });

    console.log('Retrieved cookie:', cookie);

    // Update cookie display
    if (cookie) {
      const truncatedValue = truncateCookieValue(cookie.value);
      console.log('Setting cookie display to:', truncatedValue);
      if (currentCookieElement) {
        currentCookieElement.textContent = truncatedValue;
        console.log('Cookie element updated successfully');
      } else {
        console.error('currentCookieElement is null when trying to update');
      }
    } else {
      console.log('No cookie found');
      if (currentCookieElement) {
        currentCookieElement.textContent = 'No cookie found';
        console.log('Cookie element updated to "No cookie found"');
      } else {
        console.error('currentCookieElement is null when trying to update');
      }
    }

    // Get last update from background script
    chrome.runtime.sendMessage({ action: 'getLastUpdate' }, (response) => {
      console.log('Last update response:', response);
      if (response && response.lastUpdate) {
        const formattedDate = formatDate(response.lastUpdate);
        console.log('Setting last update to:', formattedDate);
        if (lastUpdateElement) {
          lastUpdateElement.textContent = formattedDate;
          console.log('Last update element updated successfully');
        } else {
          console.error('lastUpdateElement is null when trying to update');
        }
      } else {
        console.log('No last update available');
        if (lastUpdateElement) {
          lastUpdateElement.textContent = 'No updates yet';
          console.log('Last update element updated to "No updates yet"');
        } else {
          console.error('lastUpdateElement is null when trying to update');
        }
      }
    });

  } catch (error) {
    console.error('Error updating UI:', error);
    if (currentCookieElement) {
      currentCookieElement.textContent = 'Error loading cookie';
    }
    if (lastUpdateElement) {
      lastUpdateElement.textContent = 'Error loading last update';
    }
  }
}

// Function to handle manual refresh
async function handleRefresh() {
  console.log('Refresh button clicked');
  if (!refreshButton) {
    console.error('Refresh button element is null');
    return;
  }

  refreshButton.classList.add('loading');
  refreshButton.disabled = true;

  try {
    console.log('Manual refresh triggered');
    // Trigger background script to check cookie
    await chrome.runtime.sendMessage({ action: 'checkCookie' });
    // Update UI after a short delay to allow background script to complete
    setTimeout(updateUI, 1000);
  } catch (error) {
    console.error('Error refreshing:', error);
  } finally {
    if (refreshButton) {
      refreshButton.classList.remove('loading');
      refreshButton.disabled = false;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded event fired');
  
  // Get DOM elements
  currentCookieElement = document.getElementById('currentCookie');
  lastUpdateElement = document.getElementById('lastUpdate');
  refreshButton = document.getElementById('refreshButton');

  console.log('DOM Elements after initialization:', {
    currentCookieElement: currentCookieElement ? 'exists' : 'null',
    lastUpdateElement: lastUpdateElement ? 'exists' : 'null',
    refreshButton: refreshButton ? 'exists' : 'null'
  });

  if (!currentCookieElement || !lastUpdateElement || !refreshButton) {
    console.error('Failed to initialize one or more DOM elements');
    return;
  }

  // Add event listeners
  refreshButton.addEventListener('click', handleRefresh);
  console.log('Event listeners attached');

  // Initial UI update
  console.log('Starting initial UI update');
  updateUI();
}); 