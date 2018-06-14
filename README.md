# DocUI Server

## Description
This server is a [Node.JS](https://node.js.org/) server written in [TypeScript](https://www.typescriptlang.org/) for serving up programmable documents.

## Installing DocUI-Server
1. (Clone this repository)
2. In your terminal, `cd docui-server`
3. In your terminal, `npm install .`
    - This installs all of the dependencies

## Running DocUI-Server
1. In your terminal, go to the `docui-server` directory
2. In your terminal, `npm start`
    - This looks at package.json and runs the command under "scripts"->"start"
    - This will start a web server on your machine
3. In your browser, visit the link printed on the console (default: http://localhost:8000)

## Creating a new format
In the docui interface, click "Create" to create a new format.

**left**-click that format to apply the format to a piece of text
**right**-click that format to edit its code.

## Writing new backend code
Suppose we want to create a new module for the backend. Create a new file under the `src/backend_utilities` directory. Make sure that file ends with the `.ts` extension (it should be in TypeScript).

Example: Suppose we create `src/backend_utilities/hello.ts`
```
export function myHelloFunction():string {
    return "Hello, TypeScript!";
}
```


To compile `src/backend_utilities/hello.ts` to a JavaScript file (at `built/backend_utilities/hello.js`), on your terminal, run:

```
npm run build
```

Now, we could edit our Backend code to import that function:
```
import {myHelloFunction} from './backend_utilities/hello';

console.log(myHelloFunction());
```

If you re-run this code, then `"Hello TypeScript!"` should appear in your terminal. 