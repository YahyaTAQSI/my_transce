all : up

up : 
	@docker-compose up --build

down : 
	@docker-compose down

status : 
	@docker ps