//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
var ObjectID = require('mongodb').ObjectID;
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Local
//mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

//ATLAS Cloud

mongoose.connect("mongodb+srv://budi:Belajar123@cluster0.k5lci8o.mongodb.net/stephenDB", { useNewUrlParser: true });

const itemsSchema = {
    topic: Boolean,
    name: String,
    timestamp : String
}

const Item = mongoose.model("item", itemsSchema);

const time = date.getTime();

const Item1 = new Item({
    topic: false,
    name: "Welcome to your 100Days PSLE Preparation Program!",
    timestamp: ""
});


const Item2 = new Item({
    topic: true,
    name: "<----Hit this to mark completed.",
    timestamp: ""
});

const defaultItems = [Item1, Item2];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {
    
    Item.find({})
        .then(foundItem => {
            if (foundItem.length === 0) {
                console.log("Succesfully saved all the items into DB.")
                return Item.insertMany(defaultItems);
            } else {
                return foundItem;
            }
        })
        .then(savedItem => {
            res.render("list", {
                listTitle: date.getDate(),
                newListItems: savedItem
            });       

        })
        .catch(err => console.log(err));

//  res.render("list", {listTitle: "Today", newListItems: items});

});


app.get("/about", function(req, res){
  res.render("about");
});



app.get("/admin", function (req, res) {
    Item.find({})
        .then(foundItem => {
            if (foundItem.length === 0) {
                console.log("Succesfully saved all the items into DB.")
                return Item.insertMany(defaultItems);
            } else {
                return foundItem;
            }
        })
        .then(savedItem => {
            res.render("listadmin", {
                listTitle: date.getDate(),
                newListItems: savedItem
            });

        })
        .catch(err => console.log(err));

    //  res.render("list", {listTitle: "Today", newListItems: items});

});

app.get("/admin/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then(function (foundList) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save()
                    .then(() => {
                        // Document saved successfully
                        console.log("Document save successfully");
                        res.redirect("/" + customListName);
                    })
                    .catch((error) => {
                        // Error occurred while saving document
                        console.log("Error occurred while saving document");
                    });
            } else {
                //Show an existing list
                res.render("listadmin", { listTitle: foundList.name, newListItems: foundList.items })
                console.log(foundList.name + " Found!");
            }
        }
        );
});


app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then(function (foundList) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save()
                    .then(() => {
                        // Document saved successfully
                        console.log("Document save successfully");
                        res.redirect("/" + customListName);
                    })
                    .catch((error) => {
                        // Error occurred while saving document
                        console.log("Error occurred while saving document");
                    });
            } else {
                //Show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
                console.log(foundList.name + " Found!");
            }
        }
        );
});


app.post("/completed", function (req, res) {

    const checkedItemId = req.body.checkbox;
    const listItem = req.body.listItem;
    const listTimestamp = req.body.listTimestamp;
    const listName = req.body.listName;
    const time = date.getTime();

    if (listTimestamp === "") {
        console.log(checkedItemId + " " + listItem + " " + mongoose.isValidObjectId(checkedItemId));
        Item.findOneAndUpdate({ _id: checkedItemId },
            { timestamp: time })
            .then((obj) => {
                console.log('Updated - ' + obj);
            })
            .catch((err) => {
                console.log('Error: ' + err);
            });
        //mongoose.connection.close();
        console.log("Succesfully updated the document.");
    }
    res.redirect("/");
});



app.post("/admin", function (req, res) {

    const listName = req.body.list;
    var topic = false;
    const itemName = req.body.newItem;

    console.log(topic?"checked":"unchecked" + " " + itemName);
    if (req.body.topic) topic = true; else topic = false;
    const item = new Item({
        topic : topic,
        name: itemName,
        timestamp:""
    });

    item.save();
    res.redirect("/admin");
});



let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function () {
  console.log("Server has started successfully");
});

//app.listen(process.env.PORT||3000, function() {
//  console.log("Server started on port 3000");
//})