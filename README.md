# VIDEO / CALL / CHAT

This is a simple video call and chat application using **WebRTC** and **Socket.io**.

## Technologies Used

-   WebRTC
-   Socket.io
-   Next.js
-   Node.js
-   Express
-   pnpm

## Prerequisites

-   Node.js (v14 or higher)
-   pnpm (v6 or higher)

## How To Develop

1. Clone the repository
    ```bash
    https://github.com/shu-vro/video-audio-chat.git
    cd video-audio-chat
    ```
2. Install the dependencies. **NB:** this project used pnpm as the package manager.
    ```bash
    cd server
    pnpm install
    cd ../client
    pnpm install
    ```
3. Make a file named `.env` in the client directory and add the following:
    ```env
    REACT_APP_SERVER_URL=http://localhost:3001
    ```
4. Start the server

    ```bash
    cd server
    pnpm run dev # or pnpm start if don't want to use nodemon

    # Then create a new terminal and navigate to the client directory
    cd client
    pnpm run dev
    ```

    In case You want to see the production build, you can run the following command:

    ```bash
    cd client
    pnpm run build
    pnpm run start
    ```

5. Open your browser and navigate to `http://localhost:3000`

## Troubleshooting

-   If you encounter issues with WebRTC, ensure that your server is running with SSL enabled.
-   Check the browser console for any error messages and follow the suggested solutions.

## Appendices

1. This code can be hosted anywhere, but it is recommended to use a server with SSL enabled. As WebRTC requires a secure connection to work properly. You can use [Render](https://www.render.com/) to host the server and [Vercel](https://vercel.com/) to host the client.

2. This project is a simple implementation of WebRTC and Socket.io. It is not recommended to use this code in production as it lacks many features like authentication, error handling, etc.

3. If you want to deploy this project to production, you can use the following steps:

    - Deploy the server to Render or Heroku
    - Deploy the client to Vercel or Netlify
    - Update the `.env` file in the client directory with the server URL

4. If you want to contribute to this project, you can create a pull request with your changes. I will review it and merge it if it is good. For additional information, head to [CONTRIBUTING.md](./CONTRIBUTING.md)
