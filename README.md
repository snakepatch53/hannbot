# Instalacion:

Mysql script

```sql
    CREATE DATABASE whatsapp_bot_tecnico;
    USE whatsapp_bot_tecnico;

    CREATE TABLE sessions (
        session_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        session_name VARCHAR(60),
        session_key TEXT,
        createdat VARCHAR(40)
    ) ENGINE INNODB;
```

Variables dotenv. Crear archivo .env en la raiz

```enviroment
    MYSQL_DB_HOST = "localhost"
    MYSQL_DB_USER = "root"
    MYSQL_DB_PASS = ""
    MYSQL_DB_NAME = "whatsapp_bot_tecnico"
    MYSQL_DB_PORT = "3306"
```

_Anotacion:_
Tuve un error al momento de ejecutar el metodo endFlow, que solucione modificando el archivo: 'node_modules > @bot-whatsapp > database > lib > mysql > index.cjs'
En el metodo 'save' hay una parte donde genera los valores:

```cjs
const values = [[ctx.ref, ctx.keyword, ctx.answer, ctx.refSerialize, ctx.from, JSON.stringify(ctx.options)]];
```

solo aumentamos lo siguiente:

```cjs
const values = [[ctx.ref, ctx.keyword + "", ctx.answer, ctx.refSerialize, ctx.from, JSON.stringify(ctx.options)]];
```

Espero esa sea una solucion definitiva
