FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

ARG NODE_VERSION=20.11.1
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION}"
RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm alias default ${NODE_VERSION}"

RUN su node -c "npm install -g npm"
RUN su node -c "npm install -g ngrok"