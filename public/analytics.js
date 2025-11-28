(function() {
  var trackingId = 'bc1cbd6a8225e0ba2a857593b51ad46c';
  var apiUrl = 'https://rcyktxwlfrlhxgsxxahr.supabase.co/functions/v1/track';
  var sessionId = sessionStorage.getItem('atlas_sid') || Math.random().toString(36).substring(2);
  sessionStorage.setItem('atlas_sid', sessionId);
  
  function track() {
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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