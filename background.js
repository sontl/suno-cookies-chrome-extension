import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://feoubelqhhnjthsdwtqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlb3ViZWxxaGhuanRoc2R3dHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MTk3OTcsImV4cCI6MjA1ODI5NTc5N30.rDKWMkRElq3gdpZUB7Jhq69snhrnzqEMdCKzxGwZlqE';

console.log('Initializing Supabase client...');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is missing');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client initialized successfully');

let lastValue = null;
let lastUpdateTime = null;

// Function to check cookie
async function checkCookie() {
  console.log('Checking cookie...');
  try {
    const cookie = await chrome.cookies.get({
      name: '__session',
      url: 'https://suno.com'
    });

    console.log('Current cookie:', cookie);
    console.log('Last known value:', lastValue);

    if (cookie && cookie.value !== lastValue) {
      console.log('Cookie value changed:', cookie.value);
      console.log('Previous value was:', lastValue);
      
      // Store in Supabase
      console.log('Attempting to store in Supabase...');
      
      // First delete all existing records for __session
      const { error: deleteError } = await supabase
        .from('cookie_logs')
        .delete()
        .eq('cookie_name', '__session');

      if (deleteError) {
        console.error('Error deleting existing records:', deleteError);
        return;
      }

      // Then insert the new value
      const { data, error } = await supabase
        .from('cookie_logs')
        .insert([
          { 
            cookie_name: '__session',
            cookie_value: cookie.value 
          }
        ])
        .select();

      if (error) {
        console.error('Error storing cookie value:', error);
        console.error('Error details:', error.message);
      } else {
        lastValue = cookie.value;
        lastUpdateTime = new Date().toISOString();
        console.log('Successfully stored new cookie value:', data);
      }
    } else {
      console.log('No change in cookie value');
    }
  } catch (error) {
    console.error('Error checking cookie:', error);
    console.error('Error stack:', error.stack);
  }
}

// Set up the alarm
chrome.alarms.create('cookieCheck', {
  periodInMinutes: 1/6  // This will run every 10 seconds (1/6 of a minute)
});

// Listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cookieCheck') {
    checkCookie();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  if (message.action === 'checkCookie') {
    checkCookie().then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'getLastUpdate') {
    sendResponse({ lastUpdate: lastUpdateTime });
    return true;
  }
});

// Initial check
console.log('Performing initial cookie check...');
checkCookie();