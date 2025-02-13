(ns nudge.anthropic
  (:require [clj-http.client :as http]
            [cheshire.core :as json]
            [environ.core :refer [env]]))

(def ^:private api-url "https://api.anthropic.com/v1/messages")

(defn- get-api-key []
  (or (env :anthropic-api-key)
      (throw (ex-info "ANTHROPIC_API_KEY not found in environment"
                     {:type :missing-api-key}))))

(defn generate-response
  "Generate a response from Claude based on the user's issue and chosen perspective.
   Returns the generated advice text, or throws an exception if the API call fails."
  [issue {:keys [name prompt-style]}]
  (let [system-prompt (str "You are an AI advisor speaking from the perspective of " name ". "
                          prompt-style)
        response (http/post api-url
                           {:headers {"x-api-key" (get-api-key)
                                    "anthropic-version" "2023-06-01"
                                    "content-type" "application/json"}
                            :body (json/generate-string
                                   {:model "claude-3-sonnet-20240229"
                                    :max_tokens 1024
                                    :messages [{:role "system"
                                              :content system-prompt}
                                             {:role "user"
                                              :content issue}]})
                            :throw-exceptions true
                            :as :json})]
    (-> response
        :body
        :content
        first
        :text)))