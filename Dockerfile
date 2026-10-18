FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs mcp.mjs ./
COPY lib ./lib
COPY public ./public
ENV HOST=0.0.0.0 PORT=4318
EXPOSE 4318
USER node
CMD ["node", "server.mjs"]
