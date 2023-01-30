# ex6-express-neviiim-ex6-sajaabumaizar-samahrajabi

Team Names:
* Saja Abu Maizar | ID:208072371 | sajaabu@edu.hac.ac.il
* Samah Rajabi | ID: 211558556 | samahra@edu.hac.ac.il

To retrieve an empty sequalize Users database, follow these steps:
1. In the index.js file, go to line 42 where you'll find this function:
User.sync({force: false}).then(() => {
  console.log("Users table is up");
});
2. Replace the value of the parametere "force" from "false" to "true"
3. Run the app.js file
This way, in every iteration you'll create a new and empty sequalize User database
Then ..
4. Stop the iteration of the program
5. in the function in line 42, Replace the value of the parametere "force" from "true" to "false"
This way, you've emptied the User database, then started collecting the data again.


To retrieve an empty sequalize Comments database, follow these steps:
1. In the index.js file, go to line 45 where you'll find this function:
Comment.sync({force: false}).then(() => {
  console.log("Comments table is up");
});
2. Replace the value of the parametere "force" from "false" to "true"
3. Run the app.js file
This way, in every iteration you'll create a new and empty sequalize Comment database
Then ..
4. Stop the iteration of the program
5. in the function in line 45, Replace the value of the parametere "force" from "true" to "false"
This way, you've emptied the Comment database, then started collecting the data again.

By default, our website shows the three most recent pictures when the nasa feed is loaded, you can as well choose the date you desire.

Note: we want to inform that we submitted a day late to the due date, and we would like to take advantages of the days that we have to be late, and take this one day without deducting points from the grade.
