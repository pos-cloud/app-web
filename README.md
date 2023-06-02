###  Instalaciones necesarias
------------
- [Angular](https://angular.io/)  v15.0.0
- VSCode
- NodeJs v19.7.0 (usar [nvm](https://github.com/nvm-sh/nvm))
- [Git](https://git-scm.com/) 
- [Filezilla](https://filezilla-project.org/)
- [MongoDB](https://www.mongodb.com/)

### Run locally
------------
     npm i
     npm start

### Build Cloud
------------
    docker build -t admin-poscloud . 
    docker run -d -it --name pos admin-poscloud
    rm -R /var/www/poscloud/
    docker cp pos:/app/dist/ /var/www/poscloud/

### Acceso a Testing

------------
- url: testing.poscloud.ar
- empresa: demo
- user: admin
- pass: pos

# Restaurar base demo

La base de encuentra en assets del proyecto

mongorestore --db demo --archive=/home/demo.gz --gzip

### Contribuir 

------------

- git clone https://github.com/pos-cloud/system.git

Desde project de la empresa ( https://github.com/orgs/pos-cloud/projects/1 ) tomamos la feacture y el atributo branch nos dice el nombre de la rama y desde testing se crea

- git branch TK-??
Se desarrolla y se hace commit de todo sobre la rama
Luego hacemos 
- git fetch
- git checkout testing
- git pull
- git checkout TK-??
- git rebase testing
resolvemos conflicto si hay git rebase --continue
- git push --force-with-lease
Esto hace que tu commit quede sobre lo de testing 
Realizar PR a testing
