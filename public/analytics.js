(function() {
  var trackingId = '62313c98e70d38f002d144092a5f09f3';
  // Default to a local proxy endpoint. Set `window.ATLAS_API_URL` to override
  // (useful for development or if you want to call Supabase directly).
  var apiUrl = window.ATLAS_API_URL || '/track';
  var sessionId = sessionStorage.getItem('atlas_sid') || Math.random().toString(36).substring(2);
  sessionStorage.setItem('atlas_sid', sessionId);
  
  function track() {
    // Detect if we're calling a same-origin proxy (starts with '/') or calling
    // Supabase directly. If calling Supabase directly (absolute URL), allow the
    // site to provide a key; otherwise the server proxy will inject the key.
    var isProxy = apiUrl.indexOf('/') === 0;
    var headers = { 'Content-Type': 'application/json' };
    if (!isProxy) {
      var supabaseKey = window.ATLAS_SUPABASE_KEY || (function() {
        var m = document.querySelector('meta[name="supabase-key"]');
        return m ? m.content : null;
      })();
      if (supabaseKey) {
        headers['Authorization'] = 'Bearer ' + supabaseKey;
        headers['apikey'] = supabaseKey;
      } else {
        console.warn('Atlas: no Supabase key provided for direct API calls. Consider setting window.ATLAS_SUPABASE_KEY or using the server-side /track proxy.');
      }
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