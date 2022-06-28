### eCommerce Grocernest API

<!-- Create Model command -->

npx sequelize-automate -t js -h localhost -d grocernest -u root -p root -P 3306 -e mysql -o models

<!-- Auto gen Swagger command -->

npm run swagger

<!-- Swagger Docs Page -->

http://localhost:4000/api-docs/
