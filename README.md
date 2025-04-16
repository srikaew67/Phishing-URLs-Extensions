
## Frontend Setup
1. **Check Node.js Version:**
   Make sure Node.js is installed on your machine. Run the following command to check the version of Node.js installed:
   ```bash
   npm -v
2. **Navigate to Frontend Directory**
    ```bash
    cd frontend
3. **Install dependencies**
    ```bash
    npm install
4. **Run the Development Server on localhost**
    ```bash
    npm run dev
4. **Build the react app**
    ```bash
    npm run build
This will generate the build files in the dist directory.

## Load Extensions in Browser
1. Open Your browser and navigate to Manage Extensions
2. Enable "Developer mode" 
3. Click "Load unpacked" and select the `dist` directory.

## Backend Setup
1. **Navigate to Frontend Directory**
    ```bash
    cd backend
2. **Install requirements**
    ```bash
    pip install -r requirements.txt
3. **Run the function**
    ```bash
    uvicorn main:app --reload
