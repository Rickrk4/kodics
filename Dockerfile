FROM node as nodebuilder
WORKDIR /app
USER root
COPY . .
RUN npm install && npm run prod
 

FROM webdevops/php-nginx:8.1-alpine


# Install Laravel framework system requirements (https://laravel.com/docs/8.x/deployment#optimizing-configuration-loading)
RUN apk --no-cache add \
    oniguruma-dev \
    postgresql-dev \
    libxml2-dev \
    supervisor \
    autoconf \
    build-base \
    imagemagick-dev \
    php-pear \
    poppler \
    vips-dev \
    vips-poppler \
    sqlite 


#RUN apk add --no-cache --virtual .persistent-deps libffi-dev \
#    && docker-php-ext-configure ffi --with-ffi \
#    && docker-php-ext-install ffi

  
#RUN apk --no-cache add --update --repository http://dl-3.alpinelinux.org/alpine/edge/community --repository http://dl-3.alpinelinux.org/alpine/edge/main vips-dev
# Install necessary php extensions from git.
RUN git clone https://github.com/cataphract/php-rar.git\
    && cd php-rar \
    && phpize \
    && ./configure && make && make install \
    && cd /
#RUN pecl -v install rar
RUN echo "[php-rar]" >> /usr/local/etc/php/php.ini-production &&\
    echo "extension=rar.so" >> /usr/local/etc/php/php.ini-production
RUN echo "[php-rar]" >> /usr/local/etc/php/php.ini-development &&\
    echo "extension=rar.so" >> /usr/local/etc/php/php.ini-development
RUN echo "extension=rar.so" >> /usr/local/etc/php/conf.d/docker-php-ext-rar.ini
RUN echo "ffi.enable=true" >> /usr/local/etc/php/php.ini-development && \
    echo "ffi.enable=true" >> /usr/local/etc/php/php.ini-production && \
    echo "ffi.enable=true" >> /usr/local/etc/php/conf.d/docker-php-ext-ffi.ini
#RUN git clone https://github.com/Imagick/imagick\
#    #&& tar zxvf imagick-3.7.0.tgz\
#    && cd imagick\
#    && phpize\
#    && ./configure --with-imagick=/opt/local && make && make install 

#RUN echo "[php-imagick]" >> /usr/local/etc/php/php.ini-production &&\
#    echo "extension=imagick.so" >> /usr/local/etc/php/php.ini-production &&\
#    sed -i 's/<!-- <policy domain="module" rights="none" pattern="{PS,PDF,XPS}" \/> -->/<policy domain="module" rights="read|write" pattern="{PS,PDF,XPS}" \/>/g' /etc/ImageMagick-7/policy.xml &&\
#    sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \/>/<!--<policy domain="coder" rights="none" pattern="PDF" \/>-->/g' /etc/ImageMagick-7/policy.xml


RUN echo $'[program:laravel-worker]\n\
process_name=%(program_name)s_%(process_num)02d \n\
command=php /app/artisan queue:work database --sleep=3 --tries=3 --timeout=0 --max-time=0 --memory=512 --daemon \n\
autostart=true \n\
autorestart=true \n\
stopasgroup=true \n\
killasgroup=true \n\
user=root \n\
numprocs=4 \n\
redirect_stderr=true \n\
stdout_logfile=/app/storage/logs/worker.log \n\
stopwaitsecs=3600' >> /opt/docker/etc/supervisor.d/laravel-worker.conf

RUN echo "0 0 * * * php /app/artisan schedule:run >> /dev/null 2>&1" > /etc/crontabs/root
# Copy Composer binary from the Composer official Docker image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

ENV WEB_DOCUMENT_ROOT=/app/public
ENV APP_NAME=Kodix
ENV APP_ENV=production
ENV APP_KEY=base64:b9svDZh1DfYHOryYss/kuiInBVIg/fGlk6o9RxA1QWk=
ENV APP_DEBUG=false
ENV APP_URL=http://kodix.test
ENV LOG_CHANNEL=stack
ENV LOG_DEPRECATIONS_CHANNEL=null
ENV LOG_LEVEL=debug
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/app/storage/app/database.sqlite
ENV DB_FOREIGN_KEYS=true
ENV SCOUT_DRIVER=collection
ENV COMICS_PATH="/comics"
ENV BOOKS_PATH="/books"
ENV DEBIAN_FRONTEND noninteractive


WORKDIR /app
COPY --from=nodebuilder --chown=application:application /app .

RUN composer install --no-interaction --optimize-autoloader --no-dev
RUN echo '' >> /app/storage/app/database.sqlite
# Initialize
RUN php artisan key:generate \
    && php artisan route:clear \
    && php artisan config:clear \
    && php artisan cache:clear \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache 
RUN yes | php artisan migrate:fresh

VOLUME /comics /app/storage

EXPOSE 80
