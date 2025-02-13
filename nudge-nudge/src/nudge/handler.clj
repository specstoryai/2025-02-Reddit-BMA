(ns nudge.handler
  (:require [compojure.core :refer [defroutes GET POST]]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [ring.util.response :as response]
            [cheshire.core :as json]
            [nudge.views :as views]
            [nudge.claude :as claude]
            [nudge.perspectives :refer [perspectives]]))

(defn get-perspective [name]
  (first (filter #(= name (:name %)) perspectives)))

(defn get-advice [issue perspective-name]
  (if-let [perspective (get-perspective perspective-name)]
    {:status "success"
     :advice (claude/generate-advice issue perspective)}
    {:status "error"
     :message "Perspective not found"}))

(defroutes routes
  (GET "/" [] (views/index-page))
  (POST "/api/advice" request
    (let [params (json/parse-string (slurp (:body request)) true)]
      (response/response
       (json/generate-string
        (get-advice (:issue params) (:perspective params))))))
  (route/resources "/")
  (route/not-found (views/not-found-page)))

(def app-routes
  (wrap-defaults routes (assoc-in site-defaults [:security :anti-forgery] false)))