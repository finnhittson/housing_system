# How to Code the Website

## Website Basics
We access websites through URLs. Website URL's have two parts: the website name, and the path. For our example, the website name is `localhost:3000`. Usually, the website name is something like `www.case.edu`. The path comes after the name and the default path if you just put the name in is `/`. Each page of our website will have it's own path. For this README, consider a new website component that we want to add with `/foo` as it's path. This component will be accessed using `localhost:3000/foo` in a browser.

## Component Parts
### Path
We will need a path as described above. For this example, path = `/foo`.

### HTML (.ejs)
We will need an HTML file to describe the layout of the component. Specifically, we need an html file that we can send back to the user to satisfy their request for `/foo`. We will be using a variation on `.html` that uses the `.ejs` extension. This codes the exact same as html, but we can define variables whose values we fill at render time. For example:
```
// In views/foo.ejs
<p><%=my_var%></p>
```
Creates a new basic text element, whose content is defined by `my_var`. Suppose this is inside of `views/foo.ejs`. Note that all html files must be placed in the `views` folder to be accessed and rendered. Now in our javascript code, secifically the code described in the next section, we write:
```
// In routes/foo.js
res.render('foo', {
    my_var: 'This is a dynamically determined text element'
});
```
Now when we render 'foo.html', the text will display our inputed text.

### Script/Listener (.js)
We will need a javascript script that will execute some code when we enter the path. The ultimate goal of this code is to redirect us or directly render something to screen. We implement this code using modules. By convention, we will place modules inside the `routes` directory. We will implement `/foo` in `routes/foo.js`.
```
// In routes/foo.js
const express = require('express');
var router = express.Router();
router.get('/' function(req, res, next) {
    res.render('foo', {
        my_var: 'This is a dynamically determined text element'
    });
});

module.exports = router;
```
We also need to attach this module to `app.js`.
```
// In app.js
var foo = require('./routes/foo.js');
// This line needs to be placed after "var app = express();"
app.use('/foo', foo);
```
Now when `app.js` recieves a request for `/foo`, it will send the request to `foo`. Then the `router.get()` method will be called as defined in `foo.js`. Then it renders `foo`, which points to `views/foo.html`. We can create any other function/variables/classes we need inside `foo.js`.
