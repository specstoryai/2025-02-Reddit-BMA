(ns nudge.core
  (:require [ring.adapter.jetty :as jetty]
            [ring.middleware.reload :refer [wrap-reload]]
            [nudge.handler :as handler])
  (:gen-class))

(def app
  (-> handler/app-routes
      wrap-reload))

(defn start-server [port]
  (jetty/run-jetty #'app {:port port
                          :join? false}))

(defn -main [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3000"))]
    (println "Starting server on port" port)
    (start-server port)))