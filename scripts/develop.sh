#!/bin/bash

docker-compose up --build -d
docker-compose logs --tail=1000 -f psn
