(ns nudge.claude
  (:require [clj-http.client :as http]
            [cheshire.core :as json]
            [clojure.java.io :as io]
            [clojure.string :as str]))

(def ^:private api-url "https://api.anthropic.com/v1/messages")

(defn- read-env-file []
  (try
    (let [env-contents (slurp ".env")
          env-map (->> (str/split-lines env-contents)
                      (remove str/blank?)
                      (remove #(str/starts-with? % "#"))
                      (map #(str/split % #"="))
                      (into {}))]
      env-map)
    (catch Exception _
      {})))

(def ^:private env-vars (read-env-file))

(defn- get-api-key []
  (or (get env-vars "ANTHROPIC_API_KEY")
      (throw (ex-info "ANTHROPIC_API_KEY not found in .env file"
                     {:type :missing-api-key}))))

(defn generate-advice [issue {:keys [name description]}]
  (let [system-prompt (str "You are an advisor providing concrete, actionable advice from the perspective of " name ". "
                          "This perspective is defined as: " description " "
                          "Ground your advice firmly in this philosophical or therapeutic approach. "
                          "Be direct and specific about what the person should do. "
                          "Keep your response concise but impactful.")
        response (http/post api-url
                           {:headers {"x-api-key" (get-api-key)
                                    "anthropic-version" "2023-06-01"
                                    "content-type" "application/json"}
                            :body (json/generate-string
                                   {:model "claude-3-sonnet-20240229"
                                    :max_tokens 1024
                                    :system system-prompt
                                    :messages [{:role "user"
                                              :content issue}]})
                            :as :json})]
    (-> response
        :body
        :content
        first
        :text)))