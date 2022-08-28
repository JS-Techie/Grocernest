### eCommerce Grocernest API

<!-- Create Model command -->

npx sequelize-automate -t js -h localhost -d grocernest -u root -p root -P 3306 -e mysql -o models

npx sequelize-automate -t js -h 152.67.1.126 -d ecomm -u ecomm -p ecomm@123 -P 3306 -e mysql -o models

npx sequelize-automate -t js -h 152.67.1.126 -d grocernest_pre_prod -u grocernest_pre_prod -p grocernest_pre_prod -P 3306 -e mysql -o models

<!-- Auto gen Swagger command -->

npm run swagger

<!-- Swagger Docs Page -->

http://localhost:4000/api-docs/
