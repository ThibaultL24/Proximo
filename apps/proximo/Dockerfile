# syntax=docker/dockerfile:1
# One independently deployable app: Vite React + Rails API, same HTTPS origin.
# Render: dockerContext=.; dockerfilePath=./apps/proximo/Dockerfile
ARG NODE_VERSION=22
ARG RUBY_VERSION=3.4.1

FROM node:${NODE_VERSION}-bookworm-slim AS frontend-build
WORKDIR /frontend
COPY apps/proximo/frontend/package.json apps/proximo/frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY apps/proximo/frontend/ ./
RUN npm run build

FROM ruby:${RUBY_VERSION}-slim AS rails-base
WORKDIR /rails
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      ca-certificates curl libjemalloc2 libvips42 libpq5 poppler-utils && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives
ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT=development:test \
    RAILS_SERVE_STATIC_FILES=true \
    RAILS_LOG_TO_STDOUT=true

FROM rails-base AS rails-build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git libpq-dev libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives
COPY apps/proximo/backend/Gemfile apps/proximo/backend/Gemfile.lock ./
RUN bundle install && \
    rm -rf /usr/local/bundle/ruby/*/cache /usr/local/bundle/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile
COPY apps/proximo/backend/ ./
RUN bundle exec bootsnap precompile app/ lib/

FROM rails-base AS final
COPY --from=rails-build /usr/local/bundle /usr/local/bundle
COPY --from=rails-build /rails /rails
COPY --from=frontend-build /frontend/dist/ /rails/public/
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    mkdir -p /rails/db /rails/log /rails/storage /rails/tmp /rails/public && \
    chown -R rails:rails /rails/db /rails/log /rails/storage /rails/tmp /rails/public
USER rails
ENTRYPOINT ["/rails/bin/docker-entrypoint"]
EXPOSE 10000
CMD ["./bin/rails", "server", "-b", "0.0.0.0"]
