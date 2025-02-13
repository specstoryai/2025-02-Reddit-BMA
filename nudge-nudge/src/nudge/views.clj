(ns nudge.views
  (:require [hiccup.page :refer [html5 include-css include-js]]
            [hiccup.element :refer [link-to]]
            [hiccup.form :as form]
            [nudge.perspectives :refer [perspectives]]
            [cheshire.core :as json]))

(def sample-scenario
  "I've been at my current job for 5 years. Recently, I got offered a position at a new company that pays 25% more, but my current workplace feels safe and comfortable - I know everyone, I understand the systems, and my current boss is very supportive. The new job would be challenging and require learning new skills, plus there's some uncertainty about the company's culture. I'm torn between staying in my comfort zone versus taking a risk for better pay and potential growth. What should I do?")

(def perspective-loading-states
  {"Socratic Method" ["🤔 Formulating probing questions..."
                     "🎯 Identifying core assumptions..."
                     "⚡️ Preparing dialectical approach..."
                     "🧩 Structuring logical sequence..."
                     "💭 Crafting thought experiments..."
                     "🎓 Channeling ancient wisdom..."]

   "Deontology" ["📜 Consulting moral imperatives..."
                "⚖️ Weighing universal laws..."
                "🔍 Examining categorical duties..."
                "🌟 Assessing moral worth..."
                "🤝 Considering human dignity..."
                "✨ Distilling ethical principles..."]

   "Utilitarianism" ["🧮 Calculating utility metrics..."
                    "📊 Analyzing stakeholder impact..."
                    "🌍 Measuring global effects..."
                    "📈 Quantifying happiness units..."
                    "🎲 Running probability models..."
                    "💫 Optimizing for maximum good..."]

   "Psychotherapy" ["🛋️ Preparing therapeutic space..."
                   "🧠 Analyzing emotional patterns..."
                   "🌱 Exploring root causes..."
                   "🎭 Examining past experiences..."
                   "💫 Connecting psychological dots..."
                   "✨ Synthesizing insights..."]

   "Cognitive Behavioral Therapy" ["🧠 Mapping thought patterns..."
                                 "🎯 Identifying core beliefs..."
                                 "📝 Analyzing behavior chains..."
                                 "🔄 Processing feedback loops..."
                                 "⚡️ Restructuring cognitions..."
                                 "✨ Preparing action steps..."]

   "Zen Buddhist" ["🧘 Entering mindful state..."
                  "☯️ Aligning with present moment..."
                  "🌸 Contemplating impermanence..."
                  "💫 Dissolving attachments..."
                  "✨ Channeling zen wisdom..."
                  "🍃 Finding middle way..."]

   "Existentialist" ["🔑 Exploring authentic choices..."
                    "🌟 Examining life's meaning..."
                    "🎭 Confronting uncertainty..."
                    "💫 Embracing freedom..."
                    "✨ Finding personal truth..."
                    "⚡️ Discovering essence..."]

   "Stoic" ["🏛️ Consulting ancient wisdom..."
           "⚖️ Distinguishing controllables..."
           "🧠 Applying rational judgment..."
           "💫 Finding natural order..."
           "✨ Accepting circumstances..."
           "⚡️ Cultivating virtue..."]

   "Solution-Focused" ["🎯 Identifying desired outcomes..."
                      "✨ Discovering exceptions..."
                      "💫 Building solution patterns..."
                      "⚡️ Scaling progress steps..."
                      "🌟 Creating action plans..."
                      "🔑 Finding key resources..."]})

(def inline-styles
  "<style>
    :root { --primary-color: #FF6B6B; --secondary-color: #4ECDC4; }
    body {
      font-family: 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background: #f9f9f9;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .app-title {
      font-size: 4rem;
      font-weight: bold;
      color: var(--primary-color);
      text-align: center;
      margin: 2rem 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
      animation: bounce 1s ease-in-out;
    }
    @keyframes bounce {
      0% { transform: translateY(-20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .subtitle {
      text-align: center;
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 3rem;
    }
    .issue-input {
      width: 100%;
      min-height: 150px;
      padding: 1rem;
      margin: 2rem 0;
      border: 2px solid #ddd;
      border-radius: 12px;
      font-size: 1.2rem;
      resize: vertical;
      transition: border-color 0.3s ease;
    }
    .issue-input:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 10px rgba(255,107,107,0.2);
    }
    .sample-button {
      display: block;
      margin: 0 0 0.5rem auto;
      padding: 0.5rem 1rem;
      background: #f0f0f0;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .sample-button:hover {
      background: #e5e5e5;
    }
    .perspectives-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-top: 3rem;
    }
    .perspective-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 2px solid #eee;
      height: 280px;
      display: flex;
      flex-direction: column;
    }
    .perspective-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      border-color: var(--primary-color);
    }
    .perspective-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .perspective-name {
      font-size: 1.4rem;
      font-weight: bold;
      color: #333;
      margin: 0.5rem 0;
    }
    .perspective-description {
      font-size: 0.9rem;
      color: #666;
    }
    .validation-message {
      color: var(--primary-color);
      font-size: 1.1rem;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 12px;
      background: rgba(255, 107, 107, 0.1);
      display: none;
      text-align: center;
      animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes bounceIn {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }

    .validation-message.show {
      display: block;
    }

    .validation-message span {
      font-weight: bold;
    }

    .validation-emoji {
      font-size: 1.4rem;
      margin-right: 0.5rem;
      display: inline-block;
      animation: wave 1.5s infinite;
    }

    @keyframes wave {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
      100% { transform: rotate(0deg); }
    }

    .perspective-card.loading {
      cursor: default;
      animation: pulse 2s infinite;
    }

    .perspective-card.loading:hover {
      transform: none;
      border-color: #eee;
    }

    .perspective-card.completed {
      cursor: default;
      transform: none;
    }

    .perspective-card.completed:hover {
      transform: none;
      box-shadow: none;
      border-color: #eee;
    }

    .perspective-card.completed .perspective-name {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    .loading-state {
      font-size: 1.1rem;
      color: var(--primary-color);
      margin: 1rem 0;
      animation: fadeInOut 0.5s ease-in-out;
    }

    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .advice-content {
      text-align: left;
      padding: 0 0.5rem;
      font-size: 1.1rem;
      line-height: 1.8;
      color: #333;
      animation: fadeIn 0.5s ease-in-out;
      overflow-y: auto;
      max-height: 200px;
      scrollbar-width: thin;
      scrollbar-color: var(--primary-color) #eee;
    }

    .advice-content::-webkit-scrollbar {
      width: 8px;
    }

    .advice-content::-webkit-scrollbar-track {
      background: #eee;
      border-radius: 4px;
    }

    .advice-content::-webkit-scrollbar-thumb {
      background-color: var(--primary-color);
      border-radius: 4px;
    }

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    .loading-emoji {
      display: inline-block;
      margin-right: 0.5rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>")

(def inline-scripts
  "<script>
    function loadSampleScenario() {
      const textarea = document.getElementById('issue');
      textarea.value = document.getElementById('sample-scenario').value;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }

    async function getAdvice(perspectiveCard, issue, perspectiveName) {
      const loadingStates = JSON.parse(document.getElementById('loading-states').value)[perspectiveName];
      let currentState = 0;

      // Save original content for error case
      const originalContent = perspectiveCard.innerHTML;

      // Add loading class
      perspectiveCard.classList.add('loading');

      // Start loading state animation
      const loadingInterval = setInterval(() => {
        perspectiveCard.innerHTML = `
          <div class='loading-state'>
            ${loadingStates[currentState]}
          </div>
        `;
        currentState = (currentState + 1) % loadingStates.length;
      }, 1500);

      try {
        const response = await fetch('/api/advice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            issue: issue,
            perspective: perspectiveName
          })
        });

        const data = await response.json();

        // Clear loading state
        clearInterval(loadingInterval);

        // Show advice with perspective name
        perspectiveCard.innerHTML = `
          <h3 class='perspective-name'>${perspectiveName}</h3>
          <div class='advice-content'>
            ${data.advice}
          </div>
        `;

        // Mark as completed
        perspectiveCard.classList.remove('loading');
        perspectiveCard.classList.add('completed');

      } catch (error) {
        clearInterval(loadingInterval);
        perspectiveCard.innerHTML = originalContent;
        perspectiveCard.classList.remove('loading');
        alert('Sorry, something went wrong. Please try again.');
      }
    }

    function handlePerspectiveClick(event, perspectiveName) {
      const textarea = document.getElementById('issue');
      const validationMsg = document.getElementById('validation-message');
      const card = event.currentTarget;

      // If already loading or completed, do nothing
      if (card.classList.contains('loading') || card.classList.contains('completed')) {
        return false;
      }

      if (!textarea.value.trim()) {
        event.preventDefault();
        validationMsg.classList.add('show');
        textarea.focus();

        setTimeout(() => {
          validationMsg.classList.remove('show');
        }, 5000);

        return false;
      }

      getAdvice(card, textarea.value.trim(), perspectiveName);
      return false;
    }
  </script>")

(defn layout [& content]
  (html5
   [:head
    [:meta {:charset "utf-8"}]
    [:meta {:name "viewport"
            :content "width=device-width, initial-scale=1.0"}]
    [:title "Nudge Nudge - Get Perspective"]
    inline-styles
    inline-scripts]
   [:body
    [:div.container content]]))

(defn perspective-card [{:keys [name description icon]}]
  [:div.perspective-card
   [:div.perspective-icon icon]
   [:h3.perspective-name name]
   [:p.perspective-description description]])

(defn index-page []
  (layout
    [:h1.app-title "Nudge Nudge"]
    [:p.subtitle "Share your dilemma, get perspective."]
    [:input#loading-states
     {:type "hidden"
      :value (json/generate-string perspective-loading-states)}]
    [:div
     (form/form-to [:post "/advice"]
       [:input#sample-scenario {:type "hidden" :value sample-scenario}]
       [:button.sample-button
        {:type "button"
         :onclick "loadSampleScenario()"}
        "Try a sample dilemma"]
       (form/text-area {:placeholder "What's on your mind? Share your situation or dilemma here..."
                       :class "issue-input"
                       :id "issue"}
                      "issue")
       [:div#validation-message.validation-message
        [:span.validation-emoji "👋"]
        "Oops! Mind sharing your situation first? "
        [:span "No judgment here – we're all ears! "]])]
    [:div.perspectives-grid
     (for [p (shuffle perspectives)]
       [:div.perspective-card
        {:onclick (str "return handlePerspectiveClick(event, '" (:name p) "')")}
        [:div.perspective-icon (:icon p)]
        [:h3.perspective-name (:name p)]
        [:p.perspective-description (:description p)]])]))

(defn not-found-page []
  (layout
    [:div.content
     [:h2 "404 - Page Not Found"]
     [:p "Sorry, the page you're looking for doesn't exist."]
     (link-to "/" "Go to Homepage")]))