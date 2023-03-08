//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Local
//mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

//ATLAS Cloud

mongoose.connect("mongodb+srv://budi:Belajar123@cluster0.k5lci8o.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
}

const Item = mongoose.model("item", itemsSchema);

const Item1 = new Item({
    name: "Welcome to your todolist!"
});

const Item2 = new Item({
    name: "Hit the + button to add a new item"
});

const Item3 = new Item({
    name: "<----Hit this to delete an item."
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
    name: String,
    items: [itemsSchema    ]
}

const List = mongoose.model("List", listSchema);

//*******Model.insertMany() no longer accepts a callback*******//
//Item.insertMany(defaultItems, function (err) {
//    if (err) {
//        console.log(err);
//    }else{
//    console.log("Successfuly saved all items into DB");
//    }
//});

//Item.insertMany(defaultItems);


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
            res.render("list", { listTitle: "Today",newListItems: savedItem});
        })
        .catch(err => console.log(err));

//  res.render("list", {listTitle: "Today", newListItems: items});

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




app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
                         name: itemName
                        });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
            .then(function (foundList) {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
    }

    
});


app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item
            .findByIdAndRemove(checkedItemId)
            .exec()
            .then(function (doc) {
                return doc;
                }).catch(function (error) {
                throw error;
            });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
            .then(function (foundList) {
                if (foundList) {
                    res.redirect("/" + listName);
                }
            });
        }
});



app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function () {
  console.log("Server has started successfully");
}));

//app.listen(process.env.PORT||3000, function() {
//  console.log("Server started on port 3000");
//})