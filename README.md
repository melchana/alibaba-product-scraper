# Alibaba Product Scraper

Scraper de productos de Alibaba.com desarrollado en Node.js como parte del ejercicio de evaluación para Ingeniero/a de Sistemas.

## 1. Descripción

Esta aplicación permite recibir como parámetro la URL de un producto de Alibaba.com, acceder a su página de detalle y extraer información visible y estructurada del producto.

El resultado se muestra en formato JSON directamente en la consola.
El scraper está diseñado para trabajar con URLs de este formato:
'https://www.alibaba.com/product-detail/...'

## 2. Tecnologías utilizadas

### Node.js

Se utiliza Node.js como entorno de ejecución debido a que permite desarrollar una aplicación asíncrona, modular y adecuada para tareas de scraping mediante `async/await` y Promises.

### Playwright

Se utiliza Playwright para cargar las páginas de Alibaba.com debido a que el contenido puede depender de JavaScript y de la ejecución de código en el navegador.

También permite controlar tiempos de espera, detectar errores de navegación y obtener el HTML final renderizado.

### Cheerio

Se utiliza Cheerio para analizar el HTML obtenido por Playwright y realizar la extracción de información mediante selectores CSS.

Cheerio es utilizado únicamente para el procesamiento del HTML, evitando utilizar un navegador para las tareas de análisis.

## 3. Dependencias

Las principales dependencias son:
* playwright: navegación y carga de páginas dinámicas.

* cheerio: análisis y extracción de información del HTML.

No se utilizan dependencias adicionales innecesarias.

## 4. Estructura del proyecto

alibaba-product-scraper/

│

├── src/

│   ├── config/

│   │   └── constants.js

│   │

│   ├── extractors/

│   │   ├── product.extractor.js

│   │   ├── seller.extractor.js

│   │   └── specifications.extractor.js

│   │

│   ├── parsers/

│   │   └── product.parser.js

│   │

│   ├── services/

│   │   └── browser.service.js

│   │

│   ├── utils/

│   │   ├── errors.js

│   │   └── validators.js

│   │

│   └── index.js

│

├── output/

├── .gitignore

├── package.json

├── package-lock.json

└── README.md


## 5. Instalación

### Requisitos

* Node.js
* npm
* Git

Se recomienda utilizar una versión moderna de Node.js.

### Instalar el proyecto

Clonar el repositorio:

git clone https://github.com/melchana/alibaba-product-scraper.git

cd alibaba-product-scraper

Instalar las dependencias:

npm install

Instalar el navegador Chromium utilizado por Playwright:

npx playwright install chromium

## 6. Ejecución

El scraper recibe la URL del producto como argumento:

npm start "https://www.alibaba.com/product-detail/Handmade-Sterling-Silver-Unisex-Moissanite-Diamond\_1601597750137.html"


El resultado se muestra en formato JSON en la consola.

## 7. Datos extraídos

La salida contiene los siguientes campos:

{

&#x20; "productTitle": "",

&#x20; "productId": "",

&#x20; "price": "",

&#x20; "minOrder": "",

&#x20; "images": \[],

&#x20; "description": "",

&#x20; "specifications": {},

&#x20; "sellerInfo": {

&#x20;   "name": "",

&#x20;   "store": "",

&#x20;   "rating": "",

&#x20;   "yearsOnPlatform": "",

&#x20;   "location": ""

&#x20; },

&#x20; "deliveryTerms": {

&#x20;   "incoterms": "",

&#x20;   "shippingPort": "",

&#x20;   "deliveryTime": ""

&#x20; },

&#x20; "paymentMethods": \[],

&#x20; "variations": \[],

&#x20; "url": "",

&#x20; "scrapedAt": ""

}

## 8. Manejo de errores

La aplicación contempla diferentes situaciones:

### URL inválida

Si la URL no corresponde a un producto válido de Alibaba.com, se devuelve un error:

{

&#x20; "error": true,

&#x20; "code": "INVALID\_URL",

&#x20; "message": "Debes proporcionar una URL valida de un producto de Alibaba."

}

### Timeout

Si Alibaba no responde dentro del tiempo establecido, se devuelve un error de carga:

{

&#x20; "error": true,

&#x20; "code": "PAGE\_LOAD\_ERROR",

&#x20; "message": "Alibaba no respondio dentro del tiempo limite establecido."

}

### Bloqueo o CAPTCHA

Si se detecta una página de bloqueo o CAPTCHA de Alibaba, el scraper informa que el acceso fue bloqueado.

El proyecto no intenta evadir mecanismos de seguridad o CAPTCHA.

### Producto no encontrado

Si la página se carga pero no contiene información mínima identificable del producto, se devuelve un error indicando que no se encontró información suficiente.

## 9. Validación de datos

Antes de devolver el resultado se valida que exista información mínima identificable del producto.

Actualmente se requiere:

* productTitle

* productId

Los demás campos utilizan valores seguros, como cadenas vacías o arreglos vacíos, cuando la información no está disponible.

Esto evita devolver valores 'undefined' o 'null' de forma descontrolada.

## 10. Organización del código

El proyecto está dividido por responsabilidades:

* browser.service.js: navegación y obtención del HTML.

* product.extractor.js: datos principales del producto.

* seller.extractor.js: información del vendedor.

* specifications.extractor.js: especificaciones.

* product.parser.js: construcción del resultado final.

* validators.js: validación de URL.

* errors.js: manejo de errores personalizados.

* constants.js: configuración general.

* index.js: punto de entrada de la aplicación.

Esta separación facilita el mantenimiento y permite modificar un extractor sin afectar directamente al resto del sistema.

## 11. Rendimiento

Se estableció un tiempo máximo de navegación de 12 segundos y un pequeño tiempo adicional para permitir la carga del contenido dinámico.

El objetivo es mantener el procesamiento normal por producto por debajo de los 15 segundos, sujeto al tiempo de respuesta y comportamiento de Alibaba.com.

## 12. Limitaciones y supuestos

* Alibaba.com puede modificar periódicamente su estructura HTML, clases CSS o mecanismos de carga.

* Algunos datos pueden no estar disponibles en el HTML recibido.

* La información dinámica puede depender de la región, sesión o estado de la página.

* Alibaba puede mostrar CAPTCHA o bloquear solicitudes automatizadas.

* El scraper detecta estos bloqueos, pero no intenta evadirlos.

* Los selectores utilizados se basan en estructuras y patrones visibles del sitio y pueden requerir mantenimiento si Alibaba modifica su interfaz.

* Los campos que no estén disponibles se devuelven vacíos para mantener una estructura JSON consistente.

## 13. Consideraciones sobre el acceso a Alibaba

Durante las pruebas, Alibaba.com puede presentar mecanismos de protección contra automatización, incluyendo páginas de CAPTCHA o tiempos de respuesta elevados.

Cuando esto ocurre, el programa informa el problema mediante un código de error en lugar de devolver datos incompletos como si la extracción hubiera sido exitosa.

## 14. Comandos principales

Instalar dependencias:

npm install

Instalar Chromium:

npx playwright install chromium

Ejecutar:

npm start "https://www.alibaba.com/product-detail/Handmade-Sterling-Silver-Unisex-Moissanite-Diamond_1601597750137.html"

Comprobar sintaxis de un archivo:

node -c src/index.js

## 15. Tiempo invertido

Tiempo aproximado de desarrollo y pruebas: 7hrs.

## 16. Autor

Ejercicio de evaluación técnica - Ingeniera Informatica Yessica Melina Chana Adrian.



