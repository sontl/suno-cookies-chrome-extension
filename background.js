import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

let lastValue = null;

// Function to check cookie
async function checkCookie() {
  try {
    const cookie = await chrome.cookies.get({
      name: '__session',
      url: 'https://your-domain.com' // Replace with your domain
    });

    if (cookie && cookie.value !== lastValue) {
      console.log('Cookie value changed:', cookie.value);
      
      // Store in Supabase
      const { error } = await supabase
        .from('cookie_logs')
        .insert([
          { cookie_value: cookie.value }
        ]);

      if (error) {
        console.error('Error storing cookie value:', error);
      } else {
        lastValue = cookie.value;
        console.log('Successfully stored new cookie value');
      }
    }
  } catch (error) {
    console.error('Error checking cookie:', error);
  }
}

// Check every 10 seconds
setInterval(checkCookie, 10000);

// Initial check
checkCookie();