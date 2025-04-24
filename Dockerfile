 # Image de base: Ubuntu 20.04
FROM ubuntu:20.04

# Pour éviter les questions pendant l'installation
ENV DEBIAN_FRONTEND=noninteractive

# Ajouter le dépôt pour PHP 8.2
RUN apt-get update && apt-get install -y software-properties-common
RUN add-apt-repository ppa:ondrej/php
RUN apt-get update

# Installer PHP 8.2 et les extensions nécessaires, ainsi que les autres outils
RUN apt-get install -y \
    php8.2 \
    php8.2-cli \
    php8.2-fpm \
    php8.2-mysql \
    php8.2-curl \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-zip \
    php8.2-bcmath \
    php8.2-gd \
    curl \
    git \
    zip \
    unzip \
    nodejs \
    npm \
    apache2 \
    mysql-server

# Installer Composer (pour Laravel)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Installer Angular CLI globalement
RUN npm install -g @angular/cli

# Activer le module rewrite d'Apache
RUN a2enmod rewrite

# Configuration d'Apache pour Laravel
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/mi-backend/public\n\
    <Directory /var/www/html/mi-backend/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Définir le répertoire de travail
WORKDIR /var/www/html

# Exposer les ports
EXPOSE 80 4200 3306

# Commande à exécuter au démarrage du conteneur
CMD service apache2 start && service mysql start && tail -f /dev/null