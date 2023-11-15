# research-tempest (working name)
### One search, all the journals.
- this program takes your query and enters it into several free access scholarly journals.
- very useful for AP Seminar and/or AP Research.

  #### Journals:
  - LiebertPub
  - Sage Journals
  - Google Scholar
  - ScienceDirect
    
#### How to run
- because this project uses puppeteer and nodeJS, and I don't have a server, you'll have to run it on your machine.
- It *should* work on most major operating systems or CPU architectures
##### Before running the first time:
- ensure NodeJS and NPM are installed on your system.
    - installation commands vary by OS, check google for yours if you're unsure.
##### Running the first time:
if you know what youre doing: cd to the project dir, then run `npm install` and `npm run start`.
if you don't know what you're doing (detailed instructions):
- download this repository, using the green "Code" button at the top right. Select the zip option.
- unzip this file to whatever directory you want.
- open a terminal and navigate to the file.
    - if you're uncomfortable with navigation using commands, most file manager applications have an option to open in terminal (usually on right click)
    - if yours does not have such a feature, here are the basic steps for the command approach: (instructions for Windows. Mac/linux may vary, use google)
        - identify the path of the file, for example C:\Users\yourname\path\to\the\folder
        - in your terminal, identify which directory you are in, it should be printed somewhere in the newly opened terminal window. (ex: C:\Users\yourname is the Windows default)
        - from the directory you are in, run `cd <path to folder>`. for the example path above it would look like `cd path\to\the\folder`, because we are already in the yourname directory. The path will look different depending on where you unzipped the file.
- next, once in the project directory, run `npm install`. this will install the required dependencies
- lastly, run `npm run start` which will run the project and automatically open a tab in your browser.
          
