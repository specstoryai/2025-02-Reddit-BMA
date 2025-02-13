(ns nudge.handler
  (:require [compojure.core :refer [defroutes GET POST]]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [ring.util.response :as response]
            [nudge.views :as views]))

(defroutes routes
  (GET "/" [] (views/index-page))
  (route/resources "/")
  (route/not-found (views/not-found-page)))

(def app-routes
  (wrap-defaults routes site-defaults))