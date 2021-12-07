# PSN Interview Task

### To Run

- `docker-compose up --build -d`
- `npm run build-watch`
- go to `http://localhost:8081/`

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

### TODO

- "pagify" the youtube calls rather than having it hardcoded to 10
- move youtube api key out of source
- test processor using api when quota is freed
- split out and test processor
