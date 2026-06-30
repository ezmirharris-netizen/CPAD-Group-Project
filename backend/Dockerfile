FROM php:8.2-apache
RUN a2enmod rewrite
RUN docker-php-ext-install pdo_mysql
COPY . /var/www/html
RUN sed -i 's!/var/www/html!/var/www/html!g' /etc/apache2/sites-available/000-default.conf