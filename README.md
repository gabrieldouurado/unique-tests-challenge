# Unity and Integrations tests

How to running tests:

1. Create a database container

``docker run --name fin_api_database_test -e POSTGRES_DB=fin_api_test -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres``

2. Run tests

``yarn test``