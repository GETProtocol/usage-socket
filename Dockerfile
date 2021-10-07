FROM node:16.9-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile
COPY abis abis
RUN yarn generate-types
COPY src src
COPY tsconfig.json ./
CMD yarn start