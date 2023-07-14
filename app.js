//jshintesversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect(
  "mongodb+srv://chibuikemilonze:KSHd2liJJkSJ1F4k@web.u5tyci7.mongodb.net/todolist",
  {
    useNewUrlParser: true,
  }
);
// mongoose.connect("mongodb://127.0.0.1:27017/todolist", {
//   useNewUrlParser: true,
// });
const itemsSchema = {
  name: String,
  time: {
    type: Date,
    default: Date.now,
  },
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

var today = new Date();
var options = {
  weekday: "long",
  day: "numeric",
  month: "long",
};
var day = today.toLocaleDateString("en-US", options);
app.get("/", function (req, res) {
 
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        /** Insert Items 1,2 & 3 to todolistDB */
        Item.insertMany(defaultItems)
          .then(function (result) {
            console.log("Sucessfully Added Default Items to DB.");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else res.render("list", { listTitle: "Today", listTitleday: day, newListItems: foundItems, time: Item.time });
    })
    .catch(function (err) {
      console.log(err);
    });
});
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        console.log("saved");
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          listTitleday: day,
          newListItems: foundList.items,
          time: Item.time
        });
      }
    })
    .catch(function (err) {});
});

/*  const day = "";
const day = date.getDate();
  switch (currentDay) {
    case 0:
      day = "Sunday";

      break;
    case 1:
      day = "Monday";

      break;
    case 2:
      day = "Tuesday";

      break;
    case 3:
      day = "Wednesday";

      break;
    case 4:
      day = "thursday";

      break;
    case 5:
      day = "Friday";

      break;
    case 6:
      day = "Saturday";

      break;

    default:
      console.log("Error: current day is equal to" + currentDay);
      break;
  }
  /* if (currentDay === 0) {
    day = "Sunday";
  } else if (currentDay === 1) {
    day = "Monday";
  } else if (currentDay === 2) {
    day = "Tuesday";
  } else if (currentDay === 3) {
    day = "Wednesday";
  } else if (currentDay === 4) {
    day = "Thursday";
  } else if (currentDay === 5) {
    day = "Friday";
  } else {
    day = "Saturday";
  }*/

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
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
      .catch(function (err) {
        console.log(err);
      });
  }
});
app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today" && checkedItemId != undefined) {
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    );
    res.redirect("/" + listName);
  }
});
app.get("/work", function (req, res) {
  res.render("list", { listTitleday: "Work List", newListItems: workItems });
});
app.get("/about", function (req, res) {
  res.render("about");
});
app.listen(3002, function () {
  console.log("Server is running on port 3002");
});
