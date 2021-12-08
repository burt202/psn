# PSN Interview Task

### To Run

Required: node 14+, npm, docker, docker-compose

You will need to use your own youtube API key and add it to `src/config.ts` as I have revoked mine before making this repo public

- `npm ci`
- `docker-compose up --build -d`
- `npm run build-watch`
- go to `http://localhost:8081/`

NOTE: only tested on linux, but should work on mac

### Postgres Access

- `docker exec -it [CONTAINER_ID_FROM_DOCKER_PS] bash`
- `psql -U postgres`

### Endpoints

- GET `/channels`
- GET `/videos`
- GET `/videos/:id`
- DELETE `/videos/:id`
- GET `/videos-search?searchTerm=foo`
- GET `/video-matches`

### What I Missed

Initially missed the docs on how quotas work, which slowed me down a little
https://developers.google.com/youtube/v3/determine_quota_cost

### TODO

If I spent more time on this I would...

- "pagify" the youtube calls rather than having it hardcoded to 10
- move youtube api key out of source
- unit test processor
- make processor more fault tolerant
