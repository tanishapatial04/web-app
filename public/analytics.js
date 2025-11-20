(function () {
  window.SignalVista = {
    projectId: "a349e947-664e-45b6-a49d-bd76784cc3d7",
    trackingCode: "398fd303-d5ef-4523-89ce-9084f7c02833",
    apiUrl: "https://custom-analytics-software.onrender.com/api",
  };

  // Generate session ID
  let sessionId = sessionStorage.getItem("df_session");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("df_session", sessionId);
  }

  // Track function
  window.SignalVista.track = function (eventType, eventData) {
    fetch(window.SignalVista.apiUrl + "/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: window.SignalVista.projectId,
        tracking_code: window.SignalVista.trackingCode,
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
  window.SignalVista.track("pageview");
})();
