install:
	for d in apps/*; do (cd $$d && npm install); done

test:
	for d in apps/*; do (cd $$d && npm test); done

compose-up:
	docker compose up --build

compose-down:
	docker compose down -v

helm-lint:
	helm lint helm/microshop

