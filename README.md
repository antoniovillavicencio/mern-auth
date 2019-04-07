# Como crear una aplicación web con Mongo, React y Express desde cero


En este tutorial vamos a construir las bases de una aplicación MERN, es decir, Mongo, Express, React y Node.js. La haremos desde el principio, sin utilizar `create-react-app` ya que al hacerlo de esta manera todas las configuraciones de Webpack y Babel quedan muy enterradas y dificiles de modificar. 

Nuestra aplicación base tendrá las siguientes características:

- Funcionalidades CRUD y de autenticación (JWD)
- Manejo de peticiones HTTP con un servidor Express
- Uso de Mongoose para la creación de esquemas
- APIs para autenticación y operaciones CRUD
- Modo de desarrollo y producción
- Hot Reloading tanto del cliente como del servidor mediante un solo comando

## Modelo de usuario
| Campo | Tipo | Descripción |
| --- | --- | --- | 
| `name` | String | Nombre de usuario |
| `email` | String | Para identificar cada cuenta. Solo un email por cuenta |
| `password` | String | Para autenticación |
| `created` | Date | Automáticamente generado cuando un usuario se registra |
| `updated` | Date | Automáticamente generado cuando un usuario cambia sus datos |

## API Endpoints

| Operación | API Route | Método HTTP | 
| --- | --- | --- |
| Create user | `api/users` | `POST` |
| List all users | `api/users` | `GET` |
| Fetch a user | `api/users/:userId` | `GET` |
| Update a user | `api/users/:userId` | `PUT` |
| Delete a user | `api/users/:userId` | `DELETE` |
| User sign-in | `auth/signin` | `POST` |
| User sign-out | `auth/signout` | `GET` | 

# Configurando nuestro proyecto

Lo primero que hay que hacer es inicializar nuestro projecto de Node. Node nos servirá para administrar todas las dependencias y paquetes. Desde la raiz del proyecto, 

```bash
npm init -y
```
## Dependencias
Una vez inicializado, instalemos algunas dependencias para Webpack, Babel y React:

```bash
npm i -D @babel/core @babel/cli @babel/preset-env @babel/preset-react webpack webpack-cli webpack-dev-server style-loader css-loader sass-loader node-sass babel-loader webpack-node-externals webpack-dev-middleware webpack-hot-middleware nodemon
```

Todas las dependencias anteriores son para desarrollo. `babel-core` es el paquete principal de Babel y lo necesitamos para la transpilación del código, `babel-cli` nos permite ejecutar comandos de Babel desde la terminal, `@babel/preset-env` y `@babel/preset-react` son presets para transformar formas específicas de código: `env` es para utilizar sintaxis de ES6 y `react` para JSX. 
Webpack nos servirá para compilar y hacer un *bundle* de nuestro código. Con `webpack-dev-server` tenemos acceso a *live reloading*. Los *loaders* en webpack nos ayudan a procesar diferentes tipos de archivos, es por eso que incluimos loaders para estilos, css y babel. `webpack-dev-middleware` y `webpack-hot-middleware` nos ayudarán en la etapa de desarrollo para compilar nuestros archivos desde el servidor, de esta forma podemos tener un flujo de trabajo con Nodemon en el que con cada actualización y refresco del servidor, actualizamos también nuestros archivos estáticos. 

Para producción, instalaremos las siguientes dependencias:

```bash
npm i express react react-dom  react-hot-loader mongoose
```
## Configuración de Babel

Para configurar Babel, desde la raiz del proyecto crea un archivo llamado `.babelrc` y escribe lo siguiente:

```json
{
  "presets": [
    "@babel/env",
    "@babel/preset-react"
  ],
  "plugins": [
    "react-hot-loader/babel"
  ]
}
```

Con esto le decimos a Babel que utilize los presets `env` y `react`. El plugin de `react-hot-loader/babel` es requerido por el módulo de `react-hot-loader` para compilar componentes de React.

## Configuración de Webpack

Necesitamos configurar Webpack para compilar y agrupar tanto el código del cliente como del servidor. Para el código del cliente, tendremos una configuración de desarrollo y otra de producción. En la raíz del proyecto, crea 3 archivos:
- `webpack.config.server.js`
- `webpack.config.client.js`
- `webpack.config.clientDev.js`

Los 3 archivos tienen la siguiente estructura:

```js
const path = require('path');
const webpack = require('webpack');
const CURRENT_WORKING_DIR = process.cwd();

const config = {

}

module.exports = config;
```

### Cliente (Desarrollo)

La configuración que necesitamos para el cliente es

`webpack.config.clientDev.js`
```js
const config = {
  name: "browser",
  mode: "development",
  devtool: 'eval-source-map',
  entry: [
    "react-hot-loader/patch",
    "webpack-hot-middleware/client?reload=true",
    path.join(CURRENT_WORKING_DIR, 'client/src/index.js')
  ],
  output: {
    path: path.join(CURRENT_WORKING_DIR, '/dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [ 'babel-loader' ]
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
}
```

 Las configuraciones importantes son:
 - `entry`: Especifica el punto de entrada de Webpack para que comience a compilar.
 - `output.path`: La ruta de nuestro bundle
 - `output.publicPath`: La ruta base para todos los recursos de la aplicación
 - `module`: Reglas para definir qué loader utilizar para cada tipo de archivo

### Cliente (Producción)

`webpack.config.client.js`
```js
const config = {
  mode: "production",
  entry: [ path.join(CURRENT_WORKING_DIR, 'client/src/index.js') ],
  output: {
    path: path.join(CURRENT_WORKING_DIR, '/dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [ 'babel-loader' ]
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  }
}
```


### Server

La configuración del servidor es:

`webpack.config.server.js`
```js
const config = {
  name: "server",
  entry: [ path.join(CURRENT_WORKING_DIR, '/server/server.js') ],
  target: 'node',
  output: {
    path: path.join(CURRENT_WORKING_DIR, '/dist/'),
    filename: "server.generated.js",
    publicPath: '/dist/',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [ 'babel-loader' ]
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  }
}
```
 
## Configuración de Nodemon
Vamos a utilizar Nodemon para hot-reloading de nuestro proyecto, tanto del lado del cliente como del servidor. Para configurar Nodemon e indicarle que utilice Webpack y el bundle generado, necesitamos crear un archivo `nodemon.json` en la raíz del proyecto e incluir lo siguiente:

`nodemon.json`
```json
{
  "verbose": false,
  "watch": ["./server"],
  "exec": "webpack --mode=development --config webpack.config.server.js && node ./dist/server.generated.js"
}
```
 
 
# Frontend con React

Ahora vamos a crear un frontend muy básico con React. 
Creamos un folder llamado `client` en nuestra raiz y dentro de el dos carpetas: `public` y `src`. Dentro de `public` vamos a crear un archivo `index.html` que contenga lo siguiente:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello MERN</title>
</head>
<body>
  <div id="root"></div>
  <noscript>
    You need to enable JavaScript to run this app.
  </noscript>
  <script src="../../dist/bundle.js"></script>
</body>
</html>
```

Este es el esqueleto de nuestra app de React. Solo incluye un `div` con `id="root` que incluirá todos nuestros componentes y una referencia al bundle generado por Webpack. 
 
 Ahora vamos a implementar el punto de entrada para el Frontend (el mismo que servirá de inicio para la creación del bundle de Webpack). Dentro de `client/src` creamos un archivo llamado `index.js` que incluirá lo siguiente:
 
 `index.js`
```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';

ReactDOM.render(<App />, document.getElementById('root'));
```

Lo que hacemos aquí es decirle a React que dentro de nuestro `div` con `id="root"` vamos a renderizar un componente llamado App (que vamos a crear a continuación). Este es el flujo de trabajo usual de React, construir nuestra App en un componente con el mismo nombre. Ahora vamos a crear dicho componente. Dentro de `client/src` vamos a crear un archivo llamado `App.js`:

`App.js`
```js
import React, { Component } from 'react';
import { hot } from 'react-hot-loader';

class App extends Component {
  render() {
    return (
      <h1>Hello MERN!</h1>
    );
  }
}

export default hot(module)(App);
```

Aquí estamos usando `react-hot-module` para el live reloading. 

## Añadiendo estilos
Webpack nos permite incluir en el bundle estilos provenientes desde CSS o bien desde algún pre-procesador. Ya has configurado la regla para los archivos `.scss` en webpack. Si quieres, puedes incluir una nueva regla para CSS o cualquier extensión que quieras, solo asegurate de instalar los paquetes necesarios e incluir los loaders. En `client/src` crea un nuevo archivo, `App.scss` e incluye algún estilo básico:

```scss
$background-color: #fafafa;
$main-color: #1976D2;

html {
  color: $main-color;
  background-color: $background-color;
}
```

Ahora impórtalo desde tu componente con 

```js
import "./App.scss";
```

Es todo! Los estilos serán incluidos en tu bundle. Echa un vistazo al inspector de elementos
![-w618](media/15531034637709/15531257015941.jpg)

Hay manera de compilar los estilos por separado pero va más allá de este tutorial. 

# Backend con Express y Node

Vamos a crear nuestro backend con Express y devolver el frontend de React que recién creamos cuando se haga una petición HTTP a nuestra página. 

En la raíz del proyecto, creamos una carpeta nueva llamada `server` que incluirá 3 archivos:
- `express.js` donde vamos a crear y configurar la app de Express
- `server.js` que incluirá la lógica de nuestro servidor
- `devBundle.js` para compilar el código del cliente cuando el servidor esté corriendo (únicamente en desarrollo).

También crearemos una carpeta `config` en la raíz del proyecto y dentro de ella incluiremos un archivo, `config.js` que incluirá variables de configuración relacionadas con el servidor:

`config.js`
```js
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000
}

export default config;
```

Para compilar con webpack desde el servidor:

`devBundle.js`
```js
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from './../webpack.configDev.client.js'

const compile = (app) => {
  if(process.env.NODE_ENV == 'development') {
    const compiler = webpack(webpackConfig);
    const middleware = webpackMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath
    });
    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
  }
}

export default {
  compile
}
```
Para `express.js`

```js
import express from 'express';
import devBundle from './devBundle.js';
import path from 'path';
const CURRENT_WORKING_DIR = process.cwd();

const app = express();

if (process.env.NODE_ENV == 'development') {
  devBundle.compile(app);
}

app.use(express.json());
app.use("/dist", express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

export default app;
```

Para `server.js`

```js
import app from './express';
import path from 'path';
const CURRENT_WORKING_DIR = process.cwd();

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(CURRENT_WORKING_DIR, '../client/public/index.html'));
})

app.listen(config.port, () => {
  console.log(`Server initialized on port ${config.port}`);
});
```

# npm scripts

Ya casi estamos listos para probar por primera vez nuestra app. Para facilitar la ejecución de los comandos que usaremos, vamos a crear scripts dentro de `package.json`. Crearemos los siguientes scripts:

- `development`: Para desarrollo
- `build`: Para compilar y construir los bundles listos para producción
- `start`: Para iniciar a partir de un entorno de producción

En `package.json` dentro de `scripts` añade lo siguiente:

```json
"development": "nodemon",
"build": "webpack --config webpack.config.client.js && webpack --mode=production --config webpack.config.server.js",
"start": "NODE_ENV=production node ./dist/server.generated.js"
```

Listo! Para probar que todo esté bien, corre desde la terminal `npm run development` y desde tu navegador ingresa a `http://localhost:3000` (o el puerto que hayas definido). Deberías de ver tu página de React renderizada. Prueba cambiando el texto de `App.js` o algún estilo y observa cómo se cambia en tiempo real. 
 
> Nodemon solo reinicia el servidor pero no recarga el navegador, por lo que si haces cambios en el servidor deberás de reiniciar el navegador para ver reflejados esos cambios

Tambien puedes intentar compilar todo con `npm run build` y después `npm run start`. Deberías de ver lo mismo, solo que esta vez, sin el hot reloading. 


# Conectando con MongoDB

Hasta ahora ya tenemos lista una aplicación *ERN*. Nos falta la *M* de Mongo. 

> Para esta parte, asegúrate de tener instalado MongoDB en tu computadora. Puedes seguir los pasos de la [documentación oficial](https://docs.mongodb.com/manual/installation/#mongodb-community-edition). 

Vamos a añadir algunas variables de configuración. En `config.js` añade

```js
mongoUri: process.env.MONGODB_URI || process.env.MONGO_HOST || `mongodb://${process.env.IP || 'localhost'}:${process.env.MONGO_PORT || '27017'}/mernstarter`
```

Tratamos de mantener la URI lo más general posible pero lo importante es que aquí pongas la URI de tu base de datos. 

Para trabajar con Mongo utilizaremos Mongoose, un paquete muy útil de Node.js. Vamos a inicializar y configurar mongoose desde `server/server.js`. Añade las siguientes líneas de código:

```js
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri);

mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to Mongo Database: ${mongoUri}`)
})
```

Con esto, nos estamos conectando a la base de datos con la URI que definimos en nuestro archivo de configuración. Con `mongoose.Promise` definimos que queremos usar la definición de promesas de JS. 

> Si estas trabajando en un entorno local, asegurate de correr un proceso de mongo antes de ejecutar tu servidor. Esto se logra corriendo `mongod` desde otra terminal. 

---

LISTO! Hasta ahora ya tienes una aplicación MERN totalmente funcional y lista para adaptarse a casi cualquier proyecto. Lo que haremos a continuación será añadirle algunas características comunes a muchos proyectos, como autenticación, cookies y una API básica para el manejo de usuarios. 

---

# Utilidades de Express

La mayoría de los proyectos incluyen más dependencias de las que hemos incluido para manejar las peticiones HTTP de una manera correcta. Vamos a instalar los siguientes módulos:
- `cookie-parser`: Middleware para parsear y escribir cookies en los requests. 
- `compression`: Middleware que nos ayudará a comprimir el cuerpo de nuestras respuestas
- `helmet`: Es una colección de middlewares que nos ayudan a asegurar nuestras apps de Express escribiendo varios headers HTTP
- `cors`: Middleware para habilitar CORS (Cross-origin resource sharing)

Para instalarlas, desde tu terminal ingresa

```bash
npm i cookie-parser compression helmet cors
```

Ahora vamos a importarlas y decirle a nuestra app que las use:

```js
import cookieParser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';

app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());
```

# Database User Model
Vamos a implementar el modelo de nuestro usuario con mongoose. Definiremos un *schema* con los datos necesarios, añadiremos validación en los campos y vamos a incorporar algo de *business logic* como encriptación de passwords, autenticación y validación personalizada. 

Creamos una carpeta llamada `models` dentro de `server/` y en ella crearemos un archivo llamado `user.model.js`. Primero, importaremos `mongoose` y crearemos un nuevo schema:

```js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({ 
    // Object definition
});
```

El schema recibe como parámetro un objeto. Dentro de las llaves incluiremos los datos de nuestro usuario:

```js
name: {
    type: String,
    trim: true,
    required: 'Name is required'
  },
  email: {
    type: String,
    trimg: true,
    unique: 'Email already exists',
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: 'Email is required'
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: Date,
  hashed_password: {
    type: String,
    required: 'Password is required'
  },
  salt: String 
```

Cada campo puede recibir un objeto con algunas configuraciones y características, donde definimos el tipo de dato, si es requerido o si es único. La propiedad `match` del campo de `email` es un arreglo donde el primer elemento es una [expresión regular](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) y el segundo un mensaje a devolver en caso de que no se cumpla. `hashedPassword` y `salt` son campos que representan la contraseña encriptada que usaremos para la autenticación. 
 
## Password

La contraseña es un campo crucial que debe de proporcionar seguridad al usuario. Necesita estar encriptada, validada y autenticada de manera segura como parte de nuestro modelo de usuario. En la base de datos NO VAMOS A ALMACENAR LA CONTRASEÑA, sino una versión encriptada de la misma. ¿Cómo logramos eso? Con *propiedades virtuales*. Las propiedades virtuales son propiedades que puedes definir y obtener sin que persistan en la base de datos. Escribimos lo siguiente:

```js
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });
```

En la propiedad virtual estamos mandando a llamar dos funciones parte de nuestro schema. Estas funciones harán uso de `crypto`, por lo que debemos importarlo antes de utilizarlo. Para definir los métodos en el schema:

```js
UserSchema.methods = {
    authenticate: function(plaintext) {
      return this.encryptPassword(plaintext) === this.hashed_password;
    },
    encryptPassword: function(password) {
      if(!password) return '';
      try {
        return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
      } catch (err) {
        return ''
      }
    },
    makeSalt: function() {
      return Math.round((new Date().valueOf() * Math.random())) + '';
    }
  }
```

`crypto` utiliza un valor *salt* generado de manera aleatoria para generar `hash_password`, la contraseña encriptada. Almacenamos ambos de tal manera que `crypto` pueda autenticar la contraseña ingresada en el log-in. 

Por último, añadiremos una validación a la contraseña. En el ejemplo únicamente definiremos que la contraseña sea de mínimo 6 caracteres, sin embargo, se pueden hacer validaciones más complejas utilizando regex, por ejemplo. 

```js
UserSchema.path('hashed_password').validate(function(v) {
  if(this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters');
  }
  if(this.isNew && !this._password) {
    this.invalidate('password', 'Password is required');
  }
}, null);
```

> Así como puedes pensar en un schema como el objeto de configuración para un modelo de mongoose, el *SchemaType* es un objeto de configuración para cada propiedad individual. El SchemaType dice qué deberia de tener cada ruta, qué valores tiene permitidos, etc. Cada propiedad del schema está definida por una ruta o *path*. Puedes declarar el tipo de schema directamente o con un objeto:
```js
var schema1 = new Schema({
  test: String // `test` is a path of type String
});
var schema2 = new Schema({
  // The `test` object contains the "SchemaType options"
  test: { type: String } // `test` is a path of type string
});
```
También puedes acceder al SchemaType directamente con su path:
```js
UserSchema.path('property_name')
```


Estamos validando nuestra variable virtual `password` antes de que añadamos una `hashed_password` a la base de datos. 

Finalmente, creamos y exportamos el modelo para poder usarlo en el resto de nuestro servidor:

```js
export default mongoose.model('User', UserSchema);
```

# User CRUD API

Esta API permitirá al Frontend realizar operaciones CRUD sobre los documentos generados a partir del modelo anterior. Para la implementación, separaremos las rutas de los controladores para tener todo bien organizado y montaremos estas rutas en la app de Express. Entonces, creamos dos nuevas carpetas dentro de `server/`: `routes` y `controllers`. Dentro de `routes`, creamos dos archivos: `user.routes.js` y `auth.routes.js`, que contendrán las rutas de acuerdo a nuestros endpoints

| Operación | API Route | Método HTTP | 
| --- | --- | --- |
| Create user | `api/users` | `POST` |
| List all users | `api/users` | `GET` |
| Fetch a user | `api/users/:userId` | `GET` |
| Update a user | `api/users/:userId` | `PUT` |
| Delete a user | `api/users/:userId` | `DELETE` |
| User sign-in | `auth/signin` | `POST` |
| User sign-out | `auth/signout` | `GET` | 

En `express.js` vamos a utilizar esas rutas:

```js
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';

app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);
```
Para cada router estamos indicando la ruta base en la que serán llamados. Es decir, cuando tengamos una petición HTTP en `/api/users` usaremos el conjunto de rutas de `user.routes.js`.

Ahora vamos a configurarlas. En un inicio, definiremos el comportamiento de los endpoints para los usuarios sin autenticación y después integraremos un JSON Web Token (JWT). En `user.routes.js`:

```js
import express from 'express';
import userController from '../controllers/user.controller';

const router = express.Router();

router.route('/')
  .get(userController.list)
  .post(userController.create);

router.route('/:userId')
  .get(userController.read)
  .put(userController.update)
  .delete(userController.remove);

router.param('userId', userController.userById);

export default router;
```

Vemos que estamos definiendo callbacks que provendrán de nuestra carpeta `controllers`, esto es para tener más organizado el código. Para cada una de las rutas definimos un método con un callback, es decir, si el usuario hace una petición HTTP GET a `/api/users/`, el callback que será llamado será `userController.list`. 

El método `router.param()` es un middleware que será llamado en presencia de un parámetro llamado `userId`, e.g. `/api/users/:userId`. En el, obtendremos el usuario por su ID y se lo pasaremos al siguiente middleware, que en nuestro caso puede ser el callback de `read`, `update` o `remove`. Para más información, recomiendo mucho la [documentación](https://expressjs.com/en/api.html#router.param). 

Dentro de `controllers/` vamos a crear el archivo al que hacemos referencia, `user.controller.js` y definiremos los siguientes métodos:

```js
import User from '../models/user.model';

const create = (req, res) => {
  const user = new User(req.body);
  user.save((err, result) => {
    if(err) {
      return res.status(400).json({
        error: 'There was an error saving the object to DB'
      })
    }
    res.status(200).json({
      message: "Successfully signed up!"
    })
  })
}

const list = (req, res) => {
  User.find((err, users) => {
    if(err) {
      return res.status(400).json({
        error: 'Couldnt fetch objects from DB' 
      })
    }
    res.status(200).json(users)
  }).select('name email updated created')
}

const userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: 'User not found'
      })
    }
    req.user = user;
    next();
  })
}

const read = (req, res) => {
  req.user.hashed_password = undefined;
  req.user.salt = undefined;
  return res.json(req.user);
}

const update = (req, res) => {
  let user = req.user;
  user = Object.assign(user, req.body);
  user.updated = Date.now();
  user.save((err) => {
    if(err) {
      return res.status(400).json({
        error: 'Error while updating object'
      })
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  })
}

const remove = (req, res) => {
  let user = req.user;
  user.remove((err, deletedUser) => {
    if(err) {
      return res.status(400).json({
        error: "Couldn't delete object from DB"
      })
    }
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json(deletedUser);
  })
}

export default { create, userById, read, list, remove, update }
```

Básicamente estamos usando nuestro modelo de Usuario para interactuar con la base de datos. El middleware `userById` obtiene un usuario y lo define en una propiedad del request, que es leida por el resto de los callbacks. 

## Autenticación

Para proteger y restringir el acceso a las operaciones CRUD de esta API, necesitamos incorporar mecanismos de autenticación y autorización. Uno muy conocido es **JSON Web Token (JWT)**, un mecanismo que no requiere de almacenar el estado del usuario en el servidor. Funciona de la siguiente forma:

Cada vez que un usuario se autentica en la aplicación, el servidor genera un JWT firmado con una llave secreta. Este token será almacenado del lado del cliente, ya sea por medio de cookies, `localStorage` o `sessionStorage`. Es importante recalcar que **la responsabilidad de mantener el estado del usuario (autenticado o no) recae en el cliente**. Cada vez que se hace una petición a algún endpoint protegido, el cliente deberá incluir el token que recibió del servidor cuando se autenticó. 

![diagra](media/15531034637709/diagram.png)

En `config/config.js` añade lo siguiente:

```js
jwtSecret: process.env.JWT_SECRET || "my_secret_key"
```

Ahora, vamos a crear las rutas para el log-in del usuario. En `auth.routes.js` haremos algo similar a lo que hicimos con el usuario:

```js
import express from 'express';
import authController from '../controllers/auth.controller';

const router = express.Router();

router.route('/signin')
  .post(authController.signin)

router.route('/signout')
  .get(authController.signout);

export default router;
```

Definamos esos métodos. Creamos el archivo `/controllers/auth.controller.js` e instalaremos dos paquetes nuevos para JWT:

```bash
npm i jsonwebtoken express-jwt
```

El método de `signin` es el siguiente:

```js
const signin = (req, res) => {
  User.findOne({
    "email": req.body.email
  }, (err, user) => {
    if(err || !user) {
      return res.status('401').json({
        error: 'User not found'
      })
    }

    if(!user.authenticate(req.body.password)) {
      return res.status('401').json({
        error: "Email and password don't match"
      })
    }

    const token = jwt.sign({
      _id: user._id
    }, config.jwtSecret);

    res.cookie("t", token, {
      expire: new Date() + 9999
    });

    return res.json({
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    })
  })
}
```

Primero obtenemos el usuario por su email y utilizamos el método `authenticate` que definimos en el schema del usuario. Si el usuario ha sido autenticado correctamente, generamos un token con la llave secreta y el id del usuario. Lo guardamos en una cookie y luego enviamos como respuesta el token junto con un objeto que incluye algunos datos del usuario. 

Para `signout` únicamente borraremos el cookie. Si decidieramos no utilizar cookies en esta API, el borrado del token es responsabilidad del cliente. 

```js
const signout = (req, res) => {
  res.clearCookie("t");
  return res.status(200).json({
    message: 'Signed out'
  })
}
```

Vamos a crear dos middlewares que nos servirán para proteger nuestras rutas: si el usuario se autenticó correctamente y tiene un token válido, está autorizado para hacer peticiones GET, PUT y DELETE. 

La primera función que crearemos será `requireSigning`. En esta función utilizaremos `express-kwt` para validar si el usuario que realiza la petición tiene un token válido en el header de la petición. El resultado de si está autorizado o no, lo guardaremos en una propiedad llamada `auth`:

```js
const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth'
})
```

Puesto que no tenemos control sobre el error lanzado por `express-jwt` en caso de que no encuentre ningún token, necesitamos manejarlo desde la app. En `express.js` añade la siguiente función:

```js
app.use(function(err, req, res, next) {
  if (err.name == 'UnauthorizedError') {
    res.status(401).json({
      error: 'You need to sign in! ' + err.message
    })
  }
})
```

En esa función, podemos cachar todos los errores que lance nuestra aplicación. 

La segunda función es `hasAuthorization`. Esta función verificará que, además de estar autenticado, el usuario que hace la petición está intentando borrar o modificar su perfil, no el de otro usuario. 

```js
const hasAuthorization = (req, res, next) => {
  const authorized = req.user && req.auth && req.profile._id == req.auth._id;
  if(!authorized) {
    return res.status(403).json({
      error: 'You are not authorized'
    });
  }
  next();
}

export default { signin, signout, requireSignin, hasAuthorization }
```

Ya tenemos dos métodos para proteger nuestras rutas. Protegerlas es tan facil como añadir los callbacks antes de la acción que queramos realizar. Recordemos que estos middlewares se ejecutan en cadena y cada uno tiene referencia al siguiente (por eso llamamos la función `next()` al final). En `user.routes.js` has las siguientes modificaciones:

```js
import authController from '../controllers/auth.controller';

router.route('/:userId')
  .get(authController.requireSignin, userController.read)
  .put(authController.requireSignin, authController.hasAuthorization, userController.update)
  .delete(authController.requireSignin, authController.hasAuthorization, userController.remove);
```

Nota lo fácil que es incluir condiciones para cada ruta! Listo! Ahora prueba tu backend con alguna aplicación como POSTMAN. 

---

Has llegado lejos. Has construido desde cero una app MERN completamente funcional que incluye operaciones CRUD de usuarios con una autenticación robusta. Tienes listo el frontend con React, una base de datos con Mongo y un backend listo para escalarse, con un modelo de usuario seguro. Además, está organizado de tal forma que escalar la aplicación es muy fácil: crea nuevos modelos de tu base de datos en la carpeta `models`, organiza tus rutas en `routes`,  especifica el comportamiento de tu API y añade seguridad en `controllers`. 

Si tienes alguna duda o sugerencia de cómo mejorar esta aplicación (también estoy aprendiendo), escríbeme a tonyvcj@gmail.com. 

Suerte!

