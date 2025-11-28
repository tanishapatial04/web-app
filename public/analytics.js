(function() {
  var trackingId = '62313c98e70d38f002d144092a5f09f3';
  var apiUrl = 'https://rcyktxwlfrlhxgsxxahr.supabase.co/functions/v1/track';
  var sessionId = sessionStorage.getItem('atlas_sid') || Math.random().toString(36).substring(2);
  sessionStorage.setItem('atlas_sid', sessionId);
  
  function track() {
    // Allow the site to provide the Supabase key via a global var or a meta tag.
    var supabaseKey = window.ATLAS_SUPABASE_KEY || (function() {
      var m = document.querySelector('meta[name="supabase-key"]');
      return m ? m.content : null;
    })();

    var headers = { 'Content-Type': 'application/json' };
    if (supabaseKey) {
      // Supabase convention: send both Authorization and apikey headers
      headers['Authorization'] = 'Bearer ' + supabaseKey;
      headers['apikey'] = supabaseKey;
    } else {
      console.warn('Atlas: no Supabase key provided. Set window.ATLAS_SUPABASE_KEY or a meta[name="supabase-key"] to avoid 401 errors.');
    }

    fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        tracking_id: trackingId,
        session_id: sessionId,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height
      })
    }).catch(function(e) { console.error('Atlas tracking error:', e); });
  }
  
  track();
  window.addEventListener('popstate', track);
})();