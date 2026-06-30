FROM php:8.2-apache

# 1. Enable Apache mod_rewrite (From your original file)
RUN a2enmod rewrite

# 2. Install MySQL support (From your original file)
RUN docker-php-ext-install pdo_mysql

# 3. NEW: Install system tools required by Composer (git, unzip, zip extension)
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip

# 4. NEW: Grab the official Composer tool from its official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Set the working directory inside the container
WORKDIR /var/www/html

# 6. Copy your project files (From your original file)
COPY . /var/www/html

# 7. NEW: Run composer install to build the missing 'vendor' folder
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev