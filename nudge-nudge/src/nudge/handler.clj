(ns nudge.handler
  (:require [compojure.core :refer [defroutes GET POST]]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [ring.util.response :as response]
            [cheshire.core :as json]
            [nudge.views :as views]))

(def mock-response
  "After careful consideration from my stoic perspective, here's what I see: The fear of leaving your comfort zone is natural, but remember that growth often lies just beyond it. Consider this: your current stability is admirable, but ask yourself - in 5 years, will you regret not taking this opportunity for growth? A true stoic focuses on what's within their control: your ability to adapt, learn, and face challenges with resilience. The uncertainty about company culture is outside your control, but your response to it is entirely within your power. The financial benefit is significant, but more importantly, this challenge offers a chance to practice virtue through courage and wisdom. Whatever you choose, approach it with equanimity and focus on what you can control: your attitude, effort, and commitment to excellence.")

;; Simulate a delay to show loading states
(defn get-mock-advice [issue perspective-name]
  (Thread/sleep 3000)
  {:status "success"
   :advice mock-response})

(defroutes routes
  (GET "/" [] (views/index-page))
  (POST "/api/advice" request
    (let [params (json/parse-string (slurp (:body request)) true)]
      (response/response
       (json/generate-string
        (get-mock-advice (:issue params) (:perspective params))))))
  (route/resources "/")
  (route/not-found (views/not-found-page)))

(def app-routes
  (wrap-defaults routes (assoc-in site-defaults [:security :anti-forgery] false)))