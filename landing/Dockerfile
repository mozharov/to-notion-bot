FROM nginx:alpine

RUN apk add --no-cache gettext

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV POSTHOG_KEY=""
ENV POSTHOG_HOST="https://eu.i.posthog.com"

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]