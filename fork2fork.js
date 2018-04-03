/*
Interacting with external services

Simple example of node.js app serving contents based
on an available internet service.
In this case api.openreceipemap.org

***IMPORTANT NOTE***
As of 2015 openreceipe requires that you provide an APPID
with your HTTP requests. You can get on by creating a
free account at: http://openreceipemap.org/appid



To Test: Use browser to view
http://localhost:3000/
http://localhost:3000/recipes.html
http://localhost:3000/recipes
http://localhost:3000/index.html
http://localhost:3000/
http://localhost:3000
*/

//Used the following website to help style the webpage
//http://jsfiddle.net/2fcfj/

let http = require('http')
let url = require('url')
let qstring = require('querystring')
var express=require('express')
var app=express()

const PORT = process.env.PORT || 3000
//Please register for your own key replace this with your own.
const API_KEY = '905068912ff583c7f060bbecc4f0ae58'

function sendResponse(receipeData, res){
  var page = '<html><head><title>Assignement 4</title></head>' +
  '<style>' +
'h1{background-color: tomato;color: white;padding: 10px;}input{font-size: 28px;}' +
'html{background-color:#ffcccc;}' +
'span{color:yellow;font-size:28px;font-weight: bold;padding: 5px 5px;background-color:lightblue}' +
'figure{color:yellow;font-size:28px;font-weight: bold;padding: 5px 5px;background-color:lightblue;text-align: center;}' +
'ul{padding: 10; margin:0;width:600px;float:left;list-style:none;}' +
'ul li{width:330px;height:300px;text-align:center;float:left;}' +
'.container{position: relative;max-width: 510px;margin: 0 auto;}' +
'.container img {vertical-align: middle;}'+
'.container .content {position: absolute;bottom: 1;background: rgba(0, 0, 0, 0.5); /* Black background with transparency */color: #f1f1f1;width: 92%;padding: 20px;}' +
    '</style>' +
    '<body>' +
    '<h1>Welcome to the Food to Fork </h1>'+
    '<form method="post">' +
    ' <center><span >Ingredient:</span> <input name="ingredient">' +
    '<input type="submit" value="Get Receipes">' +
    '</center>'+
    '</form>'
    +'<h1>Receipe</h1>'
  if(receipeData && JSON.parse(receipeData).count !== 0){

    //
    let k=JSON.parse(receipeData);

    recipe=
    page += renderData(receipeData)
  }
  page += '</body></html>'
  res.end(page);
}

//function to parse data from the api and convert it to a form in which is useful to the user
function renderData(data){
  let k=JSON.parse(data)

  let goodData='';

  for(let i=0;i<k.count;i++){
	 goodData+= `<ul>` + `<a href=${k.recipes[i].source_url} target="_blank"> `+ `<li> ` + `<img src=${k.recipes[i].image_url} alt=you style="width:300px;height:300px;">` + `</li>` + `<div class ="content">` + `<h1> ${k.recipes[i].title} </h1>`  + `</div>`  + `</ul>`

  }

  return goodData
}

function parseReceipe(receipeResponse, res) {
  let receipeData = ''
  receipeResponse.on('data', function (chunk) {
    receipeData += chunk
  })
  receipeResponse.on('end', function () {
    sendResponse(receipeData, res)
  })
}


function getRecipes(ingredient, res){

  const options = {
    host: 'www.food2fork.com',
    path: `/api/search?q=${ingredient}&key=${API_KEY}`
  }
  http.request(options, function(apiResponse){
    //console.log(apiResponse.data);
    parseReceipe(apiResponse, res)
  }).end()
}

 handleGetRequest= function(req,res){
   let requestURL = req.url
   let query = url.parse(requestURL).query //GET method query parameters if any
   let method = req.method

  let reqData = ''
  req.on('data', function (chunk) {
    reqData += chunk
  })
  req.on('end', function() {
    var queryParams = qstring.parse(query)
    console.log(queryParams)
    var ingredient = queryParams.ingredient
    getRecipes(ingredient, res)
  })
}


// used  to handle urls like this :http://localhost:3000/recipes?ingredient=Basil
handleGetRequest2= function(req,res){
  let requestURL = req.url
  let query = url.parse(requestURL).query //GET method query parameters if any
  let method = req.method

 let reqData = ''
 req.on('data', function (chunk) {
   reqData += chunk
 })
 req.on('end', function() {
   var queryParams = qstring.parse(query)
   var ingredient = queryParams.ingredients

	console.log('hey');
	if(queryParams.ingredients) getRecipes(ingredient, res)
	else sendResponse(null, res)
 })
}



handlePostRequest=function(req,res){

  let reqData = ''
  req.on('data', function (chunk) {
    reqData += chunk
  })
  req.on('end', function() {
  console.log(reqData);
    var queryParams = qstring.parse(reqData)
  console.log(queryParams)
    getRecipes(queryParams.ingredient, res)
  })

}
app.all('*', function(req, res, next){
  console.log('-------------------------------');
  console.log('req.path: ', req.path);

  next(); //allow next route or middleware to run
});

//start server


app.get('/recipes.html',handleGetRequest)
app.get('/recipes',handleGetRequest2)
app.get('/index.html',handleGetRequest)
app.get('/',handleGetRequest)
app.post('*',handlePostRequest)
app.listen(PORT, err => {
  if(err) console.log(err)
  else {console.log(`Server listening on port: ${PORT}`)}
})
