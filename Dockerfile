# Stage 1 — build
FROM node:18-alpine AS builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./

ARG REACT_APP_API_URL
ARG REACT_APP_SOCKET_URL
ARG REACT_APP_REALTIME_MODE=polling

ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL \
    REACT_APP_REALTIME_MODE=$REACT_APP_REALTIME_MODE

RUN npm run build

# Stage 2 — serve
FROM nginx:1.25-alpine

COPY --from=builder /app/client/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
