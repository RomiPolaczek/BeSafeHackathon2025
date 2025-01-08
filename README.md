# QueenB X AppsFlyer - BeSafe Hackathon 2025

This project template is designed for junior developers aimed at gaining hands-on experience in full-stack development. 
This project includes a Node.js server with Express and a React client (powered by Vite), providing an opportunity to engage in frontend development, backend development, and API integration.
Specifically the template is a full-stack MERN application for managing a library of rubber ducks - but you can modify it and build a library application of your choice.

## Introduction
This template includes a simple feature to display a random rubber duck from example READ ONLY database. 
This feature demonstrates the integration of the frontend with the backend and can be used to test if your setup is working correctly.

1. Client:
   - The home page contains a button labeled `Show Random Duck`.
   - When clicked, this button sends a request to the backend to fetch a random rubber duck.
   - The details of the random rubber duck, including its name and image, are displayed on the page.
2. Backend:
   - The server has an endpoint `/api/rubberDucks/random` that selects a random rubber duck from the database and returns its details in the response.
   - The server contains more endpoints, but without corresponding implementation in the client. These endpoints are to set example of more types of requests.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/en) 
  - Version 20.x or higher required (latest LTS recommended)
- `npm` (will be typically installed automatically when you install Node.js above)
  -  Version 10.x or higher required (get the latest by running `npm install -g npm@latest --no-optional`)

### Clone the Repository
To get started with this project, you need to clone the repository to your local machine. Follow these steps:
1. Create a project from this repository by clicking on `Use this template` -> `Create a new repository` (more info [here](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)) - only ONCE per project
1. Clone the new Repository: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository

### Server Setup
1. Navigate to the server directory: `cd server`
1. Install server dependencies: `npm install`

### Client Setup
1. Navigate to the client directory: `cd ../client`
1. Install client dependencies: `npm install`

## Configuration

### Environment Variables
Environment variables are used to configure your application without hardcoding sensitive information into your code. For this project, you need to set up the following environment variables in `.env` files located both in the `server` directory and `client` directory.

#### Configure the Backend (server)

Make a copy of the `.env.example` file under the `server` folder and name it `.env`. This file contains the following environment variables (you don't need to touch them at this point):
   - `CLIENT_URL` - this should match the URL of the client, which is what you'll see at the address bar of your browser after running your client (via `npm start`).
   - `PORT` - This variable defines the port on which your Express server will run. By default, this is set to `5000`, but you can change it to any available port number.

#### Configure the Frontend (client)

Make a copy of the `.env.example` file under the `client` folder and name it `.env`. 
This file contains the following environment variable (you don't need to touch them at this point):

* `VITE_SERVER_API_URL`: This variable contains the URL of your backend API. It tells your client where to send requests to interact with the server. By default, this should be set to http://localhost:5000/, but you should change it to match your server's actual URL if different (where 5000 is the `PORT` you defined in the server `.env` file above).

## Usage

This section explains how to use the application once it’s set up and configured. Follow these steps to interact with both the client and server components of the application.

### Start the Server
1. Open a terminal in the root folder of the cloned repository, and navigate to the `server` directory: `cd server`
1. Start the Express server in development mode: `npm run dev`
   - By default, the server will run on `http://localhost:5000` (see configuration section above)

### Run the Client
1. Open a **new** terminal in the root folder of the cloned repository, and navigate to the `client` directory: `cd client`

2. Run the Frontend Client: `npm run dev`
   - A new browser window with the client application should open (if you close the tab, you can return to it by navigating to http://localhost:3000/ by default)

### Test the Application

   - Click the `Show Random Duck` button to retrieve a random duck from the database and display its details on the screen.
   - This feature helps verify that your frontend can communicate with the backend. If you see the random duck's details displayed on the page, your setup is working properly.
   - You may also use an API client (like [Postman](https://www.postman.com/)) to directly test your API endpoints.

**Please report any issues or provide feedback for further improvements!**

### Stopping the Servers

- **Stop the Express Server**: In the terminal where the server is running, press `Ctrl + C` to stop the server.
- **Stop the React Client**: In the terminal where the client is running, press `Ctrl + C` to stop the client.

### Troubleshooting

Ensure backend and frontend configurations (`.env` files) are correct.

- **Server Issues**:
  - Ensure that the React development server is running and that you have no conflicting applications using port 3000.
  - Check the terminal for error messages 

- **Client Issues**:
  - Check the browser dev tools console for errors if the client is not displaying correctly (recommended: https://reactjs.org/link/react-devtools).
  - Check the browser dev tools network logs for failed requests

## Project Structure

### Client Directory (`client/`)
Contains the React (Vite) frontend application.
- `package.json`: Lists the client-side dependencies and scripts for managing the React application.
- `.env`: Stores environment variables like the API endpoint URL.
- `index.html`: Main HTML page hosting all the React components of the application (frontend entry point)
- `public/`: static assets that do not need to be processed by Vite's build pipeline. These files are copied as-is to the build output directory. In our case, the HTML's favicon.
- `src/`: Contains the source code for the React application.
   - `assets/`: assets that are part of the source code and need to be processed by Vite's build pipeline. This includes images, fonts, and other files that might be imported into your JS or CSS files. In our case, the QueenB summer camp logo.
   - `components/`: Reusable UI components such as buttons, forms, and other elements.
   - `context/`: Contains the React context for the ducks, responsible for pulling the current duck from the API
   - `pages/`: Page components that represent different routes in the application.
   - `services/`: Services for making API calls and handling business logic.
   - `styles/`: CSS and styling files for the application.
   - `App.jsx`: The main React component that sets up routing and renders the application.
   - `index.jsx`: The entry point for the React application, responsible for rendering the App component into the DOM.
      
### Server Directory (`server/`)
Contains the Node.js / Express backend application.
- `package.json`: Lists the server-side dependencies and scripts for managing the Node.js application.
- `.env`: Stores environment variables like database connection strings and server port.
- `server.js`: The main server file that sets up Express, connects to the database, and starts the server (backend entry point).
- `controllers/`: Contains the logic for handling API requests and responses.
- `data/`: Contains the initial duck data (readonly database)
- `images/`: Contains the duck images referenced by the duck data above
- `routes/`: Defines the API endpoints and maps them to controller functions.

## Best practices & Teamwork
[Full guide](BestPractices.md)

## Support

For any issues please contact us via [mail](queenb.community@gmail.com) or open an issue.

**Happy Coding! :)**
