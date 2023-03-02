# Instalacion:

Mysql script

```sql
    CREATE DATABASE hannbot;
    USE hannbot;

    CREATE TABLE sessions (
        session_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        session_name VARCHAR(60),
        session_key TEXT,
        createdat VARCHAR(40)
    ) ENGINE INNODB;
```

Variables dotenv. Crear archivo .env en la raiz

```enviroment
    # LOCAL
    APP_MODE = {{APP_MODE}} # local | production
    APP_PORT = {{APP_PORT}}

   # MYSQL
    MYSQL_DB_HOST = {{MYSQL_DB_HOST}}
    MYSQL_DB_USER = {{MYSQL_DB_USER}}
    MYSQL_DB_PASS = {{MYSQL_DB_PASS}}
    MYSQL_DB_NAME = {{MYSQL_DB_NAME}}
    MYSQL_DB_PORT = {{MYSQL_DB_PORT}}

    # SMARTOLT
    SMARTOLT_URL = {{SMARTOLT_URL}}
    SMARTOLT_USER = {{SMARTOLT_USER}}
    SMARTOLT_PASS = {{SMARTOLT_PASS}}

    # MIKROWISP
    MIKROWISP_URL = {{MIKROWISP_URL}}
    MIKROWISP_USER = {{MIKROWISP_USER}}
    MIKROWISP_PASS = {{MIKROWISP_PASS}}

    # API MORONANET
    API_MORONANET_URL = {{API_MORONANET_URL}}
    API_MORONANET_SERVICE_UPLOAD_IMG = {{API_MORONANET_SERVICE_UPLOAD_IMG}}
    API_MORONANET_KEY = {{API_MORONANET_KEY}}
```

_Anotacion:_
Tuve un error al momento de ejecutar el metodo endFlow, que solucione modificando el archivo: 'node_modules/@bot-whatsapp/database/lib/mysql/index.cjs'
En el metodo 'save' hay una parte donde genera los valores:

```cjs
const values = [[ctx.ref, ctx.keyword, ctx.answer, ctx.refSerialize, ctx.from, JSON.stringify(ctx.options)]];
```

solo aumentamos lo siguiente:

```cjs
const values = [[ctx.ref, ctx.keyword + "", ctx.answer, ctx.refSerialize, ctx.from, JSON.stringify(ctx.options)]];
```

Espero esa sea una solucion definitiva
