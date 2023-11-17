# research-tempest
### One search, all the journals.
- Currently in development (adding more journals to scrape), but LiebertPub, Sage Journals, NIH PubMed, and ScienceDirect work
- this program takes your query and enters it into several free access scholarly journals at the same time then aggregates all the results (returns the first 100 results from each site).
- very useful for AP Seminar and/or AP Research.


  #### Journals:
  - LiebertPub
  - Sage Journals
  - ScienceDirect
  - NIH PubMed
    
#### How to run
- because this project uses puppeteer and nodeJS, and I don't have a server, you'll have to run it on your machine.
- It *should* work on most major operating systems

#### if you know how to run nodejs apps: install deps with `npm install` then run with `npm run start`
#### if you don't know what you're doing, refer to the guide below:

## Getting Started

To get started, follow these steps:

1. Click on the green "Code" button on the top-right of this repository and select "Download ZIP."

2. Once the ZIP file is downloaded, unzip it to your preferred location.

## Installing Dependencies

Before running the application, you need to install its dependencies using npm (Node Package Manager). Open your terminal and navigate to the project folder. below are instructions for each major OS. You will only need to do this once, the first time you run it.

### macOS

<details>
<summary>Expand for macOS instructions</summary>

1. Open Terminal.

2. Navigate to the project folder using the `cd` command, e.g., `cd path/to/your/project`.

3. Run the following command to install dependencies:
```
npm install
```
</details>

### Linux

<details>
<summary>Expand for Linux instructions</summary>

1. Open your terminal.

2. Navigate to the project folder using the `cd` command, e.g., `cd path/to/your/project`.

3. Run the following command to install dependencies:
```
npm install
```
</details>

### Windows

<details>
<summary>Expand for Windows instructions</summary>

1. Open Command Prompt or PowerShell.

2. Navigate to the project folder using the `cd` command, e.g., `cd path\to\your\project`.

3. Run the following command to install dependencies:
```
npm install
```
</details>

## Running the Application

After installing the dependencies, you can run the application using the following steps:

### macOS, Linux, and Windows

1. In your terminal or command prompt, navigate to the project folder.

2. Run the following command to start the application:
```
npm run start
```

This will start the application, and you can access it by navigating to [http://localhost:3000](http://localhost:3000) in your preferred web browser.

If you encounter any issues, feel free to open up an issue in the Issues tab of this repository, or look below for troubleshooting:

# Troubleshooting
#### Puppeteer old Headless deprecation warning
- this will show up in the terminal after running the program. You can ignore it.
#### any nodejs error
- if something has gone wrong, the program may stop and throw an error in the terminal window. This shouldn't happen, but if it does, paste any error messages into a new issue in this repository, along with your operating system (windows, mac, linux)
