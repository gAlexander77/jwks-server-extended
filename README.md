# Project 2: Extending the basic JWKS server
This is a project for CSCE 3550
## Setup Project
- `Node.js v18.14.0` must be installed
- Run `npm install` to install all dependencies
## Run Project
Run `npm start` to start the server on `http://localhost:8080`
## Run Test
Run `npm test` to start the jest test
## Server running with the project 2 test client
![](https://github.com/gAlexander77/jwks-server-extended/blob/main/Screenshots/Running-With-Test-Client.png)
## Test Report Output
![](https://github.com/gAlexander77/jwks-server-extended/blob/main/Screenshots/Test-Report.png)
## Test running in Terminal
![](https://github.com/gAlexander77/jwks-server-extended/blob/main/Screenshots/Test-Terminal-Report.png)
## AI Usage
In the syllabus, it says it’s expected of us to use AI so I used ChatGPT to teach me how to setup Jest and had it recommend npm packages to use for converting the public key to jwks format. Because I have never used a testing framework with javascript, I asked it how to set up jest in package.json, and then it gave me some settings where I then referenced back to the jest docs to verify they were right. I was having trouble setting the public key to jwks format so I asked it for npm package recommendations. It recommended some packages so I then went to their documentations and found and verified the package functions needed for converting it jwks format then implemented it myself. 

In the second part of this project, I used ChatGPT to assist me with functionalities relating to the SQLite3 library since I'm not too familiar with it. The two things I had it help with was running the creating a function to get the ID generated in the database and resolving the error not allowing my server to read and write at the same time as the client. In the prompt for the function, I gave it the SQL query I wanted to implement and it gave me the code to extract the result from that query. In the prompt to resolve the error not allowing both the client and server to read and write at the same time, I inputted the error then it recommended me to set the journal_mode to WAL.