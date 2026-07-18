#!/bin/sh
set -eu

# Matches the api_host -> assets-host rewrite the PostHog snippet itself does in analytics.js,
# so the <link rel="preconnect"> in each page's <head> warms up the right CDN host.
export POSTHOG_ASSETS_HOST=$(echo "$POSTHOG_HOST" | sed 's/\.i\.posthog\.com/-assets.i.posthog.com/')

envsubst '${POSTHOG_KEY} ${POSTHOG_HOST}' \
  < /usr/share/nginx/html/analytics.js \
  > /tmp/analytics.js
mv /tmp/analytics.js /usr/share/nginx/html/analytics.js

for page in index.html privacy.html terms.html ru/index.html ru/privacy.html ru/terms.html; do
  envsubst '${POSTHOG_ASSETS_HOST}' \
    < "/usr/share/nginx/html/$page" \
    > /tmp/page.html
  mv /tmp/page.html "/usr/share/nginx/html/$page"
done

exec nginx -g 'daemon off;'
