# CPAD-Group-Project

# For Frontend ( first time run )
Open Terminal ( make sure YOU are in the root directory ):

1. npm innit -y
2. npm install vue-router pinia axios
3. create vite.config.js file (paste the code in the file) :

      import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'
    
    export default defineConfig({
      plugins: [vue()]
    })

4. npm run dev

# For Backend ( first time run )
Open Terminal/Laragon ( make sure YOU are in the root directory ):

1. composer install
2. create .env file (paste the code in the file) :
   
      DB_HOST=localhost
      DB_NAME=skillswap
      DB_USER=root
      DB_PASS=

      JWT_SECRET=skillswap_secret_key
   
4. create database skillswap
5. php -S localhost:8000
