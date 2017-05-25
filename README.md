# FBO-Mailer-Bot

This branch was started (forked from the MongoDB branch) as an architecture overhaul for the entire program so that I could remove NightmareJS, move to MongoDB (more appropriate for Node), and revamp the program to make it more efficient and develope it into a service instead of relying on background services (Cron, Linux, etc) to execute the program. This will allow me to make deployment easier (Docker instance) and allow for crossplatform hosts by abstracting the dependencies away. 
The rearchitecture is also a movement to support more clients in a pub-sub manner such that researchers (clients) can get daily updates and be provided with their own personalized home page containing all the scrapings just by subscribing, thus making the entire program more scalable in the long run.

The UI is currently being overhauled to use React (maybe Redux too), Bootstrap, and GraphQL to make querying easier. Using React and GraphQL will allow DataTables to stream the data that I need instead of sending it to the client all at once in the index causing long load times from DataTables.

# Usage 

1) Clone the directory and then navigate inside it:<br>
	`git clone https://www.github.com/scottshotgg/fbo-mailer-bot.git && cd fbo-mailer-bot`

2) Install the dependencies:<br>
	`npm install`

3) Start the program:<br>
	`npm test` : Start and force the scraper to run immediately after starting for testing  <br>
	`npm start`: Start the program with a scheduled run at midnight when you are ready for deployment
