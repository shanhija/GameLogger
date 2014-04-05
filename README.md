GameLogger
==========

GameLogger is a system to monitor game play activity on players' computers and publishes that information on a website. The system comprises of three conceptual component:
- **Client**: Records the open game and counts the number of mouse button and key presses per seconds (APM), and sends this information to the server.
- **Server**: The server listens to clients' updates and stores the active game and APM information to a database. It also servers browsers this data.
- **Browser**: View to the players' game and APM data. Actively polls the server for updated data and dynamically updates the web page to show the most latest gme and APM information.

The system is synchronized with the server clock, so that all clients and browsers push and pull data virtually synchronously. With a 5 second APM buffer, and one second upload times, the total latency of the APM information from the players' computer to the browser component is around 7 seconds. With a smaller buffer, this can be shortened.


System
------

# Server

The server acts as a controller to
* Provide settings to client and browsers
* Listen to clients for data upload
* Cache and store the data to a MySQL database
* Serve the cached and stored data to browsers

## Setup

The server is built with PHP and MySQL. To setup, follow these steps:
1. Use the createTables.sql to create the required MySQL tables.
2. Edit the database.php with appropriate database access.
3. Store the server files to under a URL accessible from the web.
4. Customize your own web look. 

[**Documentation**]() for customizing the web pages.

# Client

You can either download the most recent binaries

[**Download GameLogger client v1.3**](http://www.motify.fi/gamelogger/GameLogger_v1.3.zip)

or compile them yourself.

## Compiling

The most recent development environment that successfully compiles the client includes

* [QtCreator 5.2.1](http://qt-project.org/downloads)
* [Microsoft Visual C++ 2010 Express](http://www.visualstudio.com/en-us/downloads/download-visual-studio-vs#DownloadFamilies_4)
* [Microsoft 8.1 SDK](http://msdn.microsoft.com/en-us/windows/desktop/bg162891.aspx)

## Running

The client expects two parameters. The first is the name of the player. Note the player name is case sensitive and it carries through the whole system. This name is used to show the player's information on the website, and the HTML elements are tied to the player using this name. 

The second parameter is the URL to the game logger server where the clientConnect.php resides.



