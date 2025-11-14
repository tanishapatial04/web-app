(function () {
  window.dataForge = {
    projectId: "b19ba5e1-91d6-41a6-a014-6bce94349993",
    trackingCode: "6b3dbcc9-c480-4f9e-ba54-48070aac2206",
    apiUrl: "http://localhost:8000/api",
  };

  // Generate session ID
  let sessionId = sessionStorage.getItem("df_session");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("df_session", sessionId);
  }

  // Track function
  window.dataForge.track = function (eventType, eventData) {
    fetch(window.dataForge.apiUrl + "/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        ...eventData,
      }),
    });
  };

  // Auto-track pageview
  window.dataForge.track("pageview");
})();
