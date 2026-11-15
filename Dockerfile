FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY core ./core
COPY ee ./ee
RUN npm link
ENTRYPOINT ["kubeprune"]
CMD ["scan"]
