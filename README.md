# Housing Management System
### Aaron Orenstein, Niels Sogaard, Ben Mucha, Finn Hittson

## Project Stucture
### `views`
This folder contains embedded javascript (.ejs) files. These files contain partial html code that, prior to sending to the client, is filled with templatted values from the javascript code.

### `routes`
This folder contains the javascript code that handles html requests and either responds with a redirect or sends back an ejs file, providing values for templatted fields.
### `routes/utils`
This folder contains javascript and python code for connecting to the database and scripts for generating random database data.

### `public`
This folder contains CSS styling for the ejs files in `views`.

### `app.js`
This is the entry point for the webserver and specifies which file in `routes` handles which URL path.
