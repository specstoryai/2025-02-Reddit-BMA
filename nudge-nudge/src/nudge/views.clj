(ns nudge.views
  (:require [hiccup.page :refer [html5 include-css include-js]]
            [hiccup.element :refer [link-to]]
            [hiccup.form :as form]
            [nudge.perspectives :refer [perspectives]]))

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
  </style>")

(defn layout [& content]
  (html5
   [:head
    [:meta {:charset "utf-8"}]
    [:meta {:name "viewport"
            :content "width=device-width, initial-scale=1.0"}]
    [:title "Nudge Nudge - Get Perspective"]
    inline-styles]
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
    [:div
     (form/form-to [:post "/advice"]
       (form/text-area {:placeholder "What's on your mind? Share your situation or dilemma here..."
                       :class "issue-input"}
                      "issue"))]
    [:div.perspectives-grid
     (for [p perspectives]
       (perspective-card p))]))

(defn not-found-page []
  (layout
    [:div.content
     [:h2 "404 - Page Not Found"]
     [:p "Sorry, the page you're looking for doesn't exist."]
     (link-to "/" "Go to Homepage")]))