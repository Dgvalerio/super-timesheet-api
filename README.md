# Super Timesheet API

## nest g mo project
## nest g s project
## nest g r project

## docker run --name super-timesheet-postgres -e POSTGRES_USER=st -e POSTGRES_PASSWORD=st -e POSTGRES_DB=super_timesheet -p 5432:5432 -d postgres

docker build -t nest_api .
docker run nest_api
docker-compose up --build
