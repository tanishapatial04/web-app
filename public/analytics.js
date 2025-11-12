(function() {
  window.dataForge = {
    projectId: '8fddfcdc-ecd4-44b3-9a9a-739f8ddab9e8',
    trackingCode: 'ff6be3b3-c6fb-47e2-b830-2e79046ac19b',
    apiUrl: 'https://29854ad9-e857-4ef0-ba55-f5e18075b587.preview.emergentagent.com/api'
  };
  
  // Generate session ID
  let sessionId = sessionStorage.getItem('df_session');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('df_session', sessionId);
  }
  
  // Track function
  window.dataForge.track = function(eventType, eventData) {
    fetch(window.dataForge.apiUrl + '/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: window.dataForge.projectId,
        tracking_code: window.dataForge.trackingCode,
        session_id: sessionId,
        event_type: eventType,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        consent_given: true,
        ...eventData
      })
    });
  };
  
  // Auto-track pageview
  window.dataForge.track('pageview');
})();
