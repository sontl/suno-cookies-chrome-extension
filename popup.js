// DOM elements
const currentCookieElement = document.getElementById('currentCookie');
const lastUpdateElement = document.getElementById('lastUpdate');
const refreshButton = document.getElementById('refreshButton');

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
      currentCookieElement.textContent = truncatedValue;
    } else {
      console.log('No cookie found');
      currentCookieElement.textContent = 'No cookie found';
    }

    // Get last update from background script
    chrome.runtime.sendMessage({ action: 'getLastUpdate' }, (response) => {
      console.log('Last update response:', response);
      if (response && response.lastUpdate) {
        const formattedDate = formatDate(response.lastUpdate);
        console.log('Setting last update to:', formattedDate);
        lastUpdateElement.textContent = formattedDate;
      } else {
        console.log('No last update available');
        lastUpdateElement.textContent = 'No updates yet';
      }
    });

  } catch (error) {
    console.error('Error updating UI:', error);
    currentCookieElement.textContent = 'Error loading cookie';
    lastUpdateElement.textContent = 'Error loading last update';
  }
}

// Function to handle manual refresh
async function handleRefresh() {
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
    refreshButton.classList.remove('loading');
    refreshButton.disabled = false;
  }
}

// Event listeners
refreshButton.addEventListener('click', handleRefresh);

// Initial UI update
console.log('Popup script loaded');
updateUI(); 