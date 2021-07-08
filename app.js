//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-akash:Test123@cluster0.znf1v.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

// Creating a model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "Hit <-- to delete an item."
});

const defaultItems = [item1, item2, item3]



app.get("/", function(req, res) {

  Item.find(function (err, foundItems) {
    if (err) {
      console.log("Error Get");
    } else {
      if(foundItems.length == 0) {
        Item.insertMany(defaultItems, function(err) {
          if(err) {
            console.log("Error Insert Many");
          } else {
            console.log("Successfully Inserted");
          }
        })
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }
  });

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const list = req.body.list;

  const itemDoc = new Item({
    name: item
  })
  
  if (list == "Today") {
    itemDoc.save();
    res.redirect("/");
  } else {

    List.findOne({name: list}, function(err, foundList) {

      // We need to push because foundList is an array
      foundList.items.push(itemDoc);
      foundList.save();
    })

    res.redirect("/"+list);
  }

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log("Error Delete");
      } else {
        console.log("Succesfully delted one item");
      }
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull : {items: {_id : checkedItemId}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/"+listName);
      }
    });
  }

  
})

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  // Returns null if not found
  List.findOne({name: customListName}, function(err, foundListItems) {
    if(err) {
      console.log("Error FindOne");
    } else {
      if (!foundListItems) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list", {listTitle: customListName, newListItems: foundListItems.items})
      }
    }
  })

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});








// Heroku Link
// https://murmuring-spire-58318.herokuapp.com/